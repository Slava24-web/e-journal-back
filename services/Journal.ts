import { StudentInfo } from "../models/Student.ts";
import GroupsRepository from "../repositories/Groups.ts";
import StudentsRepository from "../repositories/Students.ts";
import { IMark, MarkInfo } from "../models/Marks.ts";
import MarksRepository from "../repositories/Marks.ts";
import { Conflict } from "../utils/Errors.ts";

// @ts-ignore
import WordExtractor from "word-extractor"

class JournalService {
    /** Получение всех групп */
    static async getAllGroups() {
        return await GroupsRepository.getAllGroups()
    }

    static async getStudentsByGroupId(group_id: number) {
        return await StudentsRepository.getStudentsByGroupId(group_id)
    }

    /** Загрузка группы */
    static async uploadGroup(group: any, spec_id: number | null, level_id: number | null, course: number | null) {
        const extractor = new WordExtractor();
        const extracted = extractor.extract(group.data);
        extracted
            // @ts-ignore
            .then(async (doc) => {
                const text = doc.getBody()
                const lines: string[] = text.split("\n")

                const groupItem = lines.find((line: string) => /группа/.test(line))
                // Номер группы
                const groupNumber = groupItem?.substring(0, groupItem.indexOf('группа')).trim()
                console.log("groupNumber", groupNumber)

                if (!groupNumber) {
                    throw new Error('Не удалось распознать номер группы! Пожалуйста, проверьте, что в файле присутствует номер группы (например, "37 группа").')
                }

                const group_id = await GroupsRepository.getGroupIdByGroupNumber(groupNumber)

                // Если такой группы в БД нет и заполнены все сведения о группе, то создать новую группу
                if (!group_id && level_id && spec_id && course && groupNumber) {
                    const addedGroup = await GroupsRepository.addGroup({ level_id, spec_id, course, number: groupNumber })

                    if (addedGroup) {
                        console.log(`Группа ${groupNumber} успешно создана!`)

                        const students = this.parseStudentsListFromFile(lines, addedGroup.id)
                        students.forEach((studentInfo: StudentInfo) => {
                            StudentsRepository.addStudent(studentInfo)
                            console.log(`Добавлен студент ${JSON.stringify(studentInfo)}`)
                        })
                    }
                }
            }
        );
    }

    // Парсинг списка студентов из файла
    static parseStudentsListFromFile(lines: string[], group_id: number): StudentInfo[] {
        const fioRegExp = /^[А-ЯЁ][а-яё]+(-[А-ЯЁ][а-яё]+)? [А-ЯЁ][а-яё]+( [А-ЯЁ][а-яё]+( - [а-яё]+)?)?$/

        // Список студентов загруженной группы
        return lines.reduce((result: StudentInfo[], line: string) => {
            const isFIO = fioRegExp.test(line)
            if (isFIO) {
                const [f, i, o] = line.trim().split(' ')
                const elder = /староста/.test(line)

                return [
                    ...result,
                    {
                        name: `${f} ${i} ${o}`,
                        group_id,
                        elder,
                    },
                ]
            }
            return result
        }, [])
    }

    static async addMark(markInfo: MarkInfo) {
        const hasIdenticalMark = await MarksRepository.getMarksByEventIdAndStudentId(markInfo.event_id, markInfo.student_id)

        if (Boolean(hasIdenticalMark)) {
            throw new Conflict('У данного студента уже есть оценка на этом занятии!')
        }

        return await MarksRepository.addMark(markInfo)
    }

    static async getMarksByEventId(event_id: number) {
        return await MarksRepository.getMarksByEventId(event_id)
    }

    static async updateMark(mark: IMark) {
        return await MarksRepository.updateMark(mark)
    }
}

export default JournalService