import SpecsRepository from "../repositories/Specs";
import LevelsRepository from "../repositories/Levels";
import LessonTypesRepository from "../repositories/LessonTypes";

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
}

export default ReferencesService