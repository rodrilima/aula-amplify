import { Api } from '../Api'

class StudentsApi extends Api {
  constructor() {
    super('/students')
  }
}

export const studentsApi = new StudentsApi()