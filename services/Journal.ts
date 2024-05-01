const WordExtractor = require("word-extractor");

class JournalService {
    static async uploadGroup(group: any) {
        console.log(toString.call(group))
        const extractor = new WordExtractor();
        const extracted = extractor.extract(group.data);
        // @ts-ignore
        extracted.then((doc) => {
            const text = doc.getBody()
            const lines: string[] = text.split("\n")
            console.log("lines", lines)

            const groupItem = lines.find((line: string) => /группа/.test(line))
            // Номер группы
            const groupNumber = groupItem?.substring(0, groupItem.indexOf('группа')).trim()
            console.log("groupNumber", groupNumber)

            // Список студентов
            // TODO: Добавить обработку старост и проф. орг
            const fioRegExp = /^[А-ЯЁ][а-яё]+(-[А-ЯЁ][а-яё]+)? [А-ЯЁ][а-яё]+( [А-ЯЁ][а-яё]+)?$/
            const students = lines.reduce((result: string[], line: string) => {
                const isFIO = fioRegExp.test(line)
                if (isFIO) {
                    const [f, i, o] = line.trim().split(' ')
                    return [...result, `${f} ${i} ${o}`]
                }
                return result
            }, [])

            console.log("students", students, students.length)
        });
    }
}

export default JournalService