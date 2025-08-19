class UserController {
  constructor() {}

  getUsers(_request: any, response: any) {
    return response.json({
      status: 200,
      message: "helllo, from the user controller",
    });
  }
}

export default new UserController();
