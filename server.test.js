const app = require("./server");
const supertest = require("supertest");
const request = supertest(app);

describe("register user", () => {
  it("does't register user if username already exists", async () => {
    const response = await request
      .post("/register")
      .send({ username: "alex", password: "password" });
    expect(response.body).toEqual({ response: "username already exists" });
  });
  it("registers a user to the database", async () => {
    const response = await request
      .post("/register")
      .send({ username: "newUser", password: "password" });
    expect(response.body).toEqual({ response: "added new user" });
  });
});

describe("user login", () => {
  it("doesn't log the user in if the user doesn't exist", async () => {
    const response = await request.get(
      "/login?username=NotAName&password=incorrect"
    );
    expect(response.body).toEqual({ response: "User not found" });
  });
  it("doesn't log the user in is the password is incorrect", async () => {
    const response = await request.get(
      "/login?username=test&password=incorrect"
    );
    expect(response.body).toEqual({ response: "Incorrect Password" });
  });
  it("logs the user in if the details are correct", async () => {
    const response = await request.get("/login?username=test&password=test");
    expect(response.body.response).toEqual("User Found");
  });
  it("starts a session when the user logs in", async () => {
    const response = await request.post("/sessions").send({ userID: 4 });
    expect(response.body).toEqual({ response: "session started" });
  });
});

describe("user logout", () => {
  it("ends the session when the user logs out", async () => {
    await request.post("/sessions").send({ userID: 4 });
    const response = await request.delete("/sessions").send({ userID: 4 });
    expect(response.body).toEqual({ response: "session ended" });
  });
});

describe("posting to the leaderboard", () => {
  it("posts to the leaderboard when the user is logged in", async () => {
    await request.post("/sessions").send({ userID: 4 });
    const response = await request
      .post("/leaderboard")
      .send({ username: "test", score: 0 });
    expect(response.body).toEqual({ response: "added to leaderboard" });
  });
});

describe("session check", () => {
  it("returns true when a user is logged in", async () => {
    await request.post("/sessions").send({ userID: 4 });
    const response = await request.get("/sessions");
    expect(response.body).toEqual({ response: true });
  });
  it("returns false when a user is not logged in", async () => {
    const response = await request.get("/sessions");
    expect(response.body).toEqual({ response: false });
  });
});

describe("profile customisation", () => {
  it("retrieves a profile when the user is logged in", async () => {
    await request.post("/sessions").send({ userID: 4 });
    const response = await request.get("/profile");
    expect(response.body.response).toEqual("user found");
  });
  it("changes the win message when requested", async () => {
    await request.post("/sessions").send({ userID: 4 });
    const response = await request
      .patch("/profile/win_message")
      .send({ message: "this is a win message" });
    expect(response.body).toEqual({ response: "win message updated" });
  });
  it("changes the profile picture id when requested", async () => {
    await request.post("/sessions").send({ userID: 4 });
    const response = await request
      .patch("/profile/picture")
      .send({ profilePictureID: 5 });
    expect(response.body).toEqual({ response: "profile picture updated" });
  });
});
