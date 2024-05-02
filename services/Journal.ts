import { StudentInfo } from "../models/Student";
import GroupsRepository from "../repositories/Groups";

const WordExtractor = require("word-extractor");

class JournalService {
    static async uploadGroup(group: any) {
        const extractor = new WordExtractor();
        const extracted = extractor.extract(group.data);
        // @ts-ignore
        extracted.then(async (doc) => {
            const text = doc.getBody()
            const lines: string[] = text.split("\n")
            console.log("lines", lines)

            const groupItem = lines.find((line: string) => /группа/.test(line))
            // Номер группы
            const groupNumber = groupItem?.substring(0, groupItem.indexOf('группа')).trim()
            console.log("groupNumber", groupNumber)

            if (!groupNumber) {
                throw new Error('Не удалось распознать номер группы! Пожалуйста, проверьте, что в файле присутствует номер группы (например, 37 группа).')
            }

            const group_id = await GroupsRepository.getGroupIdByGroupNumber(groupNumber)

            if (!group_id) {
                // await GroupsRepository.addGroup()
            }
            console.log("group_id", group_id)

            const fioRegExp = /^[А-ЯЁ][а-яё]+(-[А-ЯЁ][а-яё]+)? [А-ЯЁ][а-яё]+( [А-ЯЁ][а-яё]+( - [а-яё]+)?)?$/
            // Список студентов
            const students = lines.reduce((result: StudentInfo[], line: string) => {
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

            console.log("students", students, students.length)
        });
    }
}

export default JournalService