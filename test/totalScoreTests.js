const { Server } = require("socket.io");
const Client = require("socket.io-client");
const TotalScoreSocket = require("../sockets/totalScore");

module.exports = () => {
    describe("Testing High Score Socket", () => {
      let io, serverSocket, clientSocket;
  
      beforeAll((done) => {
        io = new Server(3001);
        TotalScoreSocket(io);
        clientSocket = new Client("http://localhost:3001");
  
        io.on("connection", (socket) => {
          serverSocket = socket;
        });
  
        clientSocket.on("connect", done);
      });
  
      afterAll(() => {
        io.close();
        clientSocket.close();
      });
  
      it("should emit when connected", (done) => {
        clientSocket.on("Users_by_total_score", (data) => {
          expect(data).toEqual([
            { username: "TestUser", total_score: 200 },
            { username: "Username", total_score: 100 },
          ]);
          done();
        });
      });
  
      it("should stop interval when disconnected", (done) => {
        clientSocket.disconnect();
        setTimeout(() => {
          expect(serverSocket.connected).toBe(false);
          done();
        }, 100);
      });
    });
}