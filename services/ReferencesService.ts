import SpecsRepository from "../repositories/Specs";
import LevelsRepository from "../repositories/Levels";

class ReferencesService {
    static async getAllSpecs() {
        return await SpecsRepository.getAllSpecs()
    }

    static async getAllLevels() {
        return await LevelsRepository.getAllLevels()
    }
}

export default ReferencesService