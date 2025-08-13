const { Server } = require("socket.io");
const Client = require("socket.io-client");
const WordLengthSocket = require("../sockets/wordLength");

module.exports = () => {
    describe("Testing Word Length Socket", () => {
      let io, serverSocket, clientSocket;
  
      beforeAll((done) => {
        io = new Server(3001);
        WordLengthSocket(io);
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
        clientSocket.on("Users_by_word_length", (data) => {
          expect(data).toEqual([
            { username: 'TestUser', longest_word: 'Anthony Albanese' },
            { username: 'Username', longest_word: 'aristotle' }
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