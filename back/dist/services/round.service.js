"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.endTurn = exports.startTurn = exports.createRound = void 0;
const Round_model_1 = __importDefault(require("../models/Round.model"));
const Turn_model_1 = __importDefault(require("../models/Turn.model"));
const Game_model_1 = __importDefault(require("../models/Game.model"));
const Team_model_1 = __importDefault(require("../models/Team.model"));
const wordGenerator_1 = require("../utils/wordGenerator");
const createRound = (gameId, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const game = yield Game_model_1.default.findById(gameId);
    if (!game)
        throw new Error('Game not found');
    if (game.adminId.toString() !== adminId)
        throw new Error('Unauthorized');
    // Get current round number
    const lastRound = yield Round_model_1.default.findOne({ gameId }).sort({ roundNumber: -1 });
    const roundNumber = lastRound ? lastRound.roundNumber + 1 : 1;
    const round = new Round_model_1.default({
        gameId,
        roundNumber,
        status: 'ACTIVE'
    });
    yield round.save();
    game.currentRound = roundNumber;
    yield game.save();
    return round;
});
exports.createRound = createRound;
const startTurn = (roundId, describerId) => __awaiter(void 0, void 0, void 0, function* () {
    const round = yield Round_model_1.default.findById(roundId);
    if (!round)
        throw new Error('Round not found');
    // Logic to determine team? 
    // Usually, the game logic decides whose turn it is. 
    // For simplicity based on requirements, we might need more info or infer it.
    // Let's assume the client sends the teamId or we infer it from the user.
    // Wait, the API doesn't take teamId in body. 
    // "POST /rounds/:roundId/turns/start"
    // We need to find which team the describer belongs to.
    // Find team for user in this game
    // We need to look up TeamPlayer, but we don't have easy access here without importing models or helper.
    // Let's rely on finding the TeamPlayer.
    const TeamPlayer = (yield Promise.resolve().then(() => __importStar(require('../models/TeamPlayer.model')))).default;
    const teamPlayer = yield TeamPlayer.findOne({ userId: describerId });
    // We should also check if the team belongs to the game of the round.
    if (!teamPlayer)
        throw new Error('User not assigned to a team');
    const team = yield Team_model_1.default.findById(teamPlayer.teamId);
    if (!team)
        throw new Error('Team not found');
    if (team.gameId.toString() !== round.gameId.toString())
        throw new Error('User team not in this game');
    // Generate words
    const words = (0, wordGenerator_1.generateWords)(5);
    const turn = new Turn_model_1.default({
        roundId,
        teamId: team._id,
        describerId,
        words,
        startTime: new Date(),
        duration: 30, // Default 30s
        status: 'ACTIVE'
    });
    yield turn.save();
    return turn;
});
exports.startTurn = startTurn;
const endTurn = (turnId) => __awaiter(void 0, void 0, void 0, function* () {
    const turn = yield Turn_model_1.default.findById(turnId);
    if (!turn)
        throw new Error('Turn not found');
    turn.status = 'COMPLETED';
    yield turn.save();
    return turn;
});
exports.endTurn = endTurn;
