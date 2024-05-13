// @ts-ignore
import ContentBasedRecommender from "content-based-recommender"
import { AlignmentType, Document, Packer, Paragraph, TextRun } from "docx"
import { readFile } from 'node:fs/promises'
import { getTextExtractor } from 'office-text-extractor'
import fs from 'fs/promises';
import { TaskInfo } from "../models/Tasks.ts";
import { PkInfo } from "../models/Pk.ts";
import StudentsRepository from "../repositories/Students.ts";
import { Student } from "../models/Student.ts";
import MarksRepository from "../repositories/Marks.ts";
import { IMark } from "../models/Marks.ts";

/**
 1. Для генерации заданий добавить выбор группы. Если группы нет, то загрузить из файла
 2. Создать два роута для генерации заданий
 3. При генерации контрольных:
    - Передавать два номера тем (1, 2) и сложность
    - Парсинг листа контрольных задач
    - Сформировать рандомным образом список из двух задач (по каждой введённой теме) каждому студенту
    - Записать список контрольных в .doc файл
    - Вернуть .doc файл
 4. При генерации домашних:
    - Добавить пометку в журнале "Контрольная работа"
    - Указать зачтённые ПК каждому студенту
    - Сформировать домашние задания всей группе:
        - Если у студента зачтены все компетенции, то домашних заданий для него нет
        - Если у студента остались не зачтённые компетенции, то на основе этого списка сформировать ему список ДЗ (через РС)
    - Записать список домашних заданий в .doc файл
 */

class GeneratorService {
    /** Генерация контрольных */
    static async generateControlWorks(file: File, info: { difficult: number, group_id: number, theme_number: number[] }) {
        const extractor = getTextExtractor()

        // @ts-ignore
        const text = await extractor.extractText({ input: file?.data, type: 'file' })
        const lists = text.split('===')

        /** Контрольные задачи */
        const controlTaskList = lists[2]
        const controlTasks: TaskInfo[] = this.getControlTasks(controlTaskList)

        const students = await StudentsRepository.getStudentsByGroupId(info.group_id)

        const filteredTasks = controlTasks.filter((task: TaskInfo) => {
            return info.theme_number.includes(task.theme)
        })

        const filteredTasks1 = filteredTasks.filter(({ level }: TaskInfo) => level === 1)
        const filteredTasks2 = filteredTasks.filter(({ level }: TaskInfo) => level === 2)

        const individualControlWorks = students?.map((student: Student) => {
            return {
                name: student.name,
                task1: filteredTasks1[Math.floor(Math.random() * filteredTasks1.length)],
                task2: filteredTasks2[Math.floor(Math.random() * filteredTasks2.length)],
            }
        }) ?? []

        const themes = this.getThemes(lists[4])

        const doc = new Document({
            sections: [
                {
                    properties: {
                    },
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Контрольная работа",
                                    bold: true,
                                    size: '14pt',
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: {
                                after: 300
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Темы:",
                                    size: '12pt'
                                }),
                            ]
                        }),
                        ...themes
                            .filter(({ number }) => info.theme_number.includes(number))
                            .map(({ theme }, index: number) => {
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: `${index + 1}. ${theme}`,
                                            size: '12pt',
                                        })
                                    ],
                                    spacing: {
                                        after: index === 1 ? 300 : 0
                                    }
                                })
                            }),
                        ...individualControlWorks.reduce((result: Paragraph[], controlWork) => {
                            return [
                                ...result,
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: controlWork.name,
                                            bold: true,
                                            size: '12pt',
                                        }),
                                    ],
                                    spacing: {
                                        after: 200,
                                        before: 200,
                                    }
                                }),
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: `Задача 1. ${controlWork.task1.text}`,
                                            size: '12pt',
                                        }),
                                    ],
                                    spacing: {
                                        after: 200
                                    }
                                }),
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: `Задача 2. ${controlWork.task2.text}`,
                                            size: '12pt',
                                        }),
                                    ],
                                    spacing: {
                                        after: 200
                                    }
                                }),
                            ]
                        }, []),
                    ],
                },
            ],
        });

        return await Packer.toBase64String(doc)
    }

    /** Генерация домашних заданий */
    static async generateHomeWorks(file: File, info: { difficult: number, group_id: number, theme_number: number[], event_id: number }) {
        const extractor = getTextExtractor()

        // @ts-ignore
        const text = await extractor.extractText({ input: file?.data, type: 'file' })
        const lists = text.split('===')

        /** Задачи из excel файла по всем выбранным темам */
        const themesTasks = info.theme_number.reduce((result: TaskInfo[], theme) => {
            // Номер листа с задачами по выбранной теме
            const themeTasksList = lists[4 + theme]
            const themeTasksByList = this.getThemeTasks(themeTasksList, theme)
            return [...result, ...themeTasksByList]
        }, [])

        const reqPks: number[] = Array.from(new Set(themesTasks.reduce((result: number[], task: TaskInfo) => {
            task.pks.forEach((pk: number) => {
                result.push(pk)
            })
            return result
        }, [])))

        console.log("reqPks", reqPks)

        const themesTasksContent = themesTasks.map((task: TaskInfo, index: number) => ({
            id: index + 1,
            content: task.pks.join(', ')
        }))

        const recommender = new ContentBasedRecommender({
            minScore: 0.2,
            maxSimilarDocuments: 100
        })

        const students = await StudentsRepository.getStudentsByGroupId(info.group_id)

        const homeWorks = await students?.reduce(async (works: { id: number; name: string; tasks: TaskInfo[] }[], student: Student) => {
            const marks = await MarksRepository.getMarksByEventIdAndStudentId(info.event_id, student.id)
            const mark = marks?.[0]

            // Оценка за контрольную
            if (mark?.pks?.length) {
                const restPks = reqPks.reduce((result: number[], pkNumber: number) => {
                    const pksStudentArray = mark.pks.split(', ').map((pk: string) => Number.parseInt(pk, 10))
                    if (!pksStudentArray?.includes(pkNumber)) {
                        return [...result, pkNumber]
                    }
                    return result
                }, [])

                console.log("restPks", restPks)
                console.log("mark", mark)

                recommender.train([
                    {
                        id: 0,
                        content: restPks.join(', '),
                    },
                    ...themesTasksContent,
                ]);

                // Получаем массив рекомендация для компетенций студента
                const similarDocuments = recommender.getSimilarDocuments(0, 0);

                console.log("similarDocuments", similarDocuments)

                return [
                    ...(await works ?? []),
                    {
                        student_id: student.id,
                        name: student.name,
                        tasks: similarDocuments.reduce((result: TaskInfo[],document: { id: number; score: number }, index: number) => {
                            if (index < 5) {
                                return [
                                    ...result,
                                    themesTasks[document.id - 1]
                                ]
                            }
                            return result
                        }, [])
                    }
                ]
            }
            return await works
        }, [])

        const themes = this.getThemes(lists[4])

        const doc = new Document({
            sections: [
                {
                    properties: {
                    },
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Домашнее задание",
                                    bold: true,
                                    size: '14pt',
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: {
                                after: 300
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Темы:",
                                    size: '12pt'
                                }),
                            ]
                        }),
                        ...themes
                            .filter(({ number }) => info.theme_number.includes(number))
                            .map(({ theme }, index: number) => {
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: `${index + 1}. ${theme}`,
                                            size: '12pt',
                                        })
                                    ],
                                    spacing: {
                                        after: index === 1 ? 300 : 0
                                    }
                                })
                            }),
                        ...(homeWorks.reduce((result: Paragraph[], homeWork: { id: number; name: string; tasks: TaskInfo[] }) => {
                            return [
                                ...result,
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: homeWork.name,
                                            bold: true,
                                            size: '12pt',
                                        }),
                                    ],
                                    spacing: {
                                        after: 200,
                                        before: 200,
                                    }
                                }),
                                ...homeWork.tasks.map((task, index: number) => {
                                    return new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `Задача ${index + 1}. ${task?.text}`,
                                                size: '12pt',
                                            }),
                                        ],
                                        spacing: {
                                            after: 200
                                        }
                                    })
                                }),
                            ]
                        }, [])),
                    ],
                },
            ],
        });

        return await Packer.toBase64String(doc)
    }

    /** Парсинг листа с контрольными заданиями */
    static getControlTasks(list: string): TaskInfo[] {
        return list.split('---').reduce((result: TaskInfo[], line: string) => {
            const themeNumberStartIndex = line.indexOf('№темы:')
            const taskLevelStartIndex = line.indexOf('уровень:')
            const pkStartIndex = line.indexOf('ПК:')

            const taskReqEndIndex = line.indexOf('условие задачи:') + 'условие задачи:'.length
            const themeNumberEndIndex = line.indexOf('№темы:') + '№темы:'.length
            const taskLevelEndIndex = line.indexOf('уровень:') + 'уровень:'.length
            const pkEndIndex = line.indexOf('ПК:') + 'ПК:'.length

            const taskReqString = line.substring(taskReqEndIndex + 1, themeNumberStartIndex).trim()
            const taskThemeNumberString = line.substring(themeNumberEndIndex + 1, taskLevelStartIndex).trim()
            const taskLevelString = line.substring(taskLevelEndIndex + 1, pkStartIndex).trim() // 1
            const pkString = line.substring(pkEndIndex + 1).trim() // 10;11;17;19

            const taskLevel: number = Number.parseInt(taskLevelString)
            const taskThemeNumber: number = Number.parseInt(taskThemeNumberString)
            const pkArray: number[] = pkString.split(';').map((string) => Number.parseInt(string))

            if (taskReqString && Boolean(taskLevel) && !pkArray.some((pkNumber) => !pkNumber) && taskThemeNumber) {
                return [
                    ...result,
                    {
                        text: taskReqString,
                        theme: taskThemeNumber,
                        level: taskLevel,
                        pks: pkArray,
                    }
                ]
            }

            return result
        }, [])
    }

    /** Парсинг листа с тематическими заданиями */
    static getThemeTasks(list: string, theme_number: number): TaskInfo[] {
        return list.split('---').reduce((result: TaskInfo[], line: string) => {
            const taskLevelStartIndex = line.indexOf('уровень:')
            const pkStartIndex = line.indexOf('ПК:')

            const taskReqEndIndex = line.indexOf('условие задачи:') + 'условие задачи:'.length
            const taskLevelEndIndex = line.indexOf('уровень:') + 'уровень:'.length
            const pkEndIndex = line.indexOf('ПК:') + 'ПК:'.length

            const taskReqString = line.substring(taskReqEndIndex + 1, taskLevelStartIndex).trim()
            const taskLevelString = line.substring(taskLevelEndIndex + 1, pkStartIndex).trim() // 1
            const pkString = line.substring(pkEndIndex + 1).trim() // 10;11;17;19

            const taskLevel: number = Number.parseInt(taskLevelString)
            const pkArray: number[] = pkString.split(';').map((string) => Number.parseInt(string))

            if (taskReqString && Boolean(taskLevel) && !pkArray.some((pkNumber) => !pkNumber) && theme_number) {
                return [
                    ...result,
                    {
                        text: taskReqString,
                        theme: theme_number,
                        level: taskLevel,
                        pks: pkArray,
                    }
                ]
            }

            return result
        }, [])
    }

    /** Парсинг листа с компетенциями */
    static getPks(list: string) {
        return list.split('---').reduce((result: PkInfo[], line: string) => {
            const pkNumberStartIndex = line.indexOf(':')
            const pkNameStartIndex = line.indexOf('ПК компетенции:')
            const pkNameEndIndex = line.indexOf('ПК компетенции:') + 'ПК компетенции:'.length

            const pkNumber = Number.parseInt(line.substring(pkNumberStartIndex + 1, pkNameStartIndex))
            const pkName = line.substring(pkNameEndIndex + 1)

            if (Boolean(pkNumber) && pkName) {
                return [
                    ...result,
                    {
                        number: pkNumber,
                        name: pkName.substring(0, pkName.indexOf('\n')).trim(),
                    }
                ]
            }

            return result
        }, [])
    }

    /** Парсинг листа с темами */
    static getThemes(list: string) {
        return list.split('---').reduce((result: { number: number; theme: string }[], line: string) => {
            const themeStartIndex = line.indexOf('тема:')
            const themeEndIndex = themeStartIndex + 'тема:'.length
            const krStartIndex = line.indexOf('к.р')

            const theme = line.substring(themeEndIndex + 1, krStartIndex)

            if (theme.substring(0, theme.indexOf('\n')).trim()) {
                return [
                    ...result,
                    {
                        number: result.length + 1,
                        theme: theme.substring(0, theme.indexOf('\n')).trim(),
                    }
                ]
            }

            return result
        }, [])
    }

    static async getRecommend() {
        // const recommender = new ContentBasedRecommender({
        //     minScore: 0.1,
        //     maxSimilarDocuments: 100
        // })

        const documents = [
            { id: '1000001', content: 'Why studying javascript is fun?' },
            { id: '1000002', content: 'The trend for javascript in machine learning' },
            { id: '1000003', content: 'The most insightful stories about JavaScript' },
            { id: '1000004', content: 'Introduction to Machine Learning' },
            { id: '1000005', content: 'Machine learning and its application' },
            { id: '1000006', content: 'Python vs Javascript, which is better?' },
            { id: '1000007', content: 'How Python saved my life?' },
            { id: '1000008', content: 'The future of Bitcoin technology' },
            { id: '1000009', content: 'Is it possible to use javascript for machine learning?' }
        ];

        // recommender.train(documents);
        //
        // const similarDocuments = recommender.getSimilarDocuments('1000002', 0, 10);

        // console.log(similarDocuments);
    }
}

export default GeneratorService