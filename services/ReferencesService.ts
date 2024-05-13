import SpecsRepository from "../repositories/Specs.ts";
import LevelsRepository from "../repositories/Levels.ts";
import LessonTypesRepository from "../repositories/LessonTypes.ts";
import DisciplinesRepository from "../repositories/Disciplines.ts";

class ReferencesService {
    static async getAllSpecs() {
        return await SpecsRepository.getAllSpecs()
    }

    static async getAllLevels() {
        return await LevelsRepository.getAllLevels()
    }

    static async getAllLessonTypes() {
        return await LessonTypesRepository.getAllLessonTypes()
    }

    static async getAllDisciplines() {
        return await DisciplinesRepository.getAllDisciplines()
    }
}

export default ReferencesService