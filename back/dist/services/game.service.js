"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kickPlayer = exports.leaveGame = exports.joinGame = exports.restartGame = exports.startGame = exports.getGameState = exports.createGame = void 0;
const Game_model_1 = __importDefault(require("../models/Game.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const Team_model_1 = __importDefault(require("../models/Team.model"));
const Round_model_1 = __importDefault(require("../models/Round.model"));
const Turn_model_1 = __importDefault(require("../models/Turn.model"));
const generateUniqueCode = () => __awaiter(void 0, void 0, void 0, function* () {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;
    while (!isUnique) {
        code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const existingGame = yield Game_model_1.default.findOne({ code });
        if (!existingGame) {
            isUnique = true;
        }
    }
    return code;
});
const createGame = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const code = yield generateUniqueCode();
    // Create the game first (without adminId initially)
    const game = new Game_model_1.default({ code });
    // Create the admin user
    const user = new User_model_1.default({
        nickname: input.nickname,
        role: 'ADMIN',
        gameId: game._id
    });
    yield user.save();
    // Update game with adminId
    game.adminId = user._id;
    yield game.save();
    return Object.assign({ gameId: game._id, userId: user._id }, game.toObject());
});
exports.createGame = createGame;
const getGameState = (gameIdOrCode) => __awaiter(void 0, void 0, void 0, function* () {
    let game;
    if (gameIdOrCode.length === 24) {
        game = yield Game_model_1.default.findById(gameIdOrCode);
    }
    else {
        game = yield Game_model_1.default.findOne({ code: gameIdOrCode.toUpperCase() });
    }
    if (!game)
        throw new Error('Game not found');
    const gameId = game._id;
    const users = yield User_model_1.default.find({ gameId });
    const teams = yield Team_model_1.default.find({ gameId });
    const rounds = yield Round_model_1.default.find({ gameId });
    // Fetch turns for all rounds
    const roundIds = rounds.map(r => r._id);
    const turns = yield Turn_model_1.default.find({ roundId: { $in: roundIds } });
    return Object.assign(Object.assign({}, game.toObject()), { users,
        teams,
        rounds,
        turns });
});
exports.getGameState = getGameState;
const startGame = (gameId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const game = yield Game_model_1.default.findById(gameId);
    if (!game)
        throw new Error('Game not found');
    if (game.adminId.toString() !== userId)
        throw new Error('Unauthorized');
    game.status = 'PLAYING';
    yield game.save();
    return game;
});
exports.startGame = startGame;
const restartGame = (gameId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const game = yield Game_model_1.default.findById(gameId);
    if (!game)
        throw new Error('Game not found');
    if (game.adminId.toString() !== userId)
        throw new Error('Unauthorized');
    // Reset game status
    game.status = 'LOBBY';
    game.currentRound = 0;
    yield game.save();
    // Delete rounds, turns
    const rounds = yield Round_model_1.default.find({ gameId });
    const roundIds = rounds.map(r => r._id);
    yield Turn_model_1.default.deleteMany({ roundId: { $in: roundIds } });
    yield Round_model_1.default.deleteMany({ gameId });
    // Reset scores
    yield Team_model_1.default.updateMany({ gameId }, { score: 0 });
    return game;
});
exports.restartGame = restartGame;
const joinGame = (gameIdOrCode, nickname) => __awaiter(void 0, void 0, void 0, function* () {
    let game;
    if (gameIdOrCode.length === 24) {
        game = yield Game_model_1.default.findById(gameIdOrCode);
    }
    else {
        game = yield Game_model_1.default.findOne({ code: gameIdOrCode.toUpperCase() });
    }
    if (!game)
        throw new Error('Game not found');
    const user = new User_model_1.default({
        nickname,
        role: 'PLAYER',
        gameId: game._id
    });
    yield user.save();
    const gameState = yield (0, exports.getGameState)(game._id.toString());
    return Object.assign({ userId: user._id }, gameState);
});
exports.joinGame = joinGame;
const leaveGame = (gameId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_model_1.default.findByIdAndDelete(userId);
});
exports.leaveGame = leaveGame;
const kickPlayer = (gameId, adminId, playerId) => __awaiter(void 0, void 0, void 0, function* () {
    const game = yield Game_model_1.default.findById(gameId);
    if (!game)
        throw new Error('Game not found');
    if (game.adminId.toString() !== adminId)
        throw new Error('Unauthorized');
    return yield User_model_1.default.findByIdAndDelete(playerId);
});
exports.kickPlayer = kickPlayer;
