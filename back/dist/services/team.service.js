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
exports.removePlayer = exports.assignPlayer = exports.createTeams = void 0;
const Team_model_1 = __importDefault(require("../models/Team.model"));
const TeamPlayer_model_1 = __importDefault(require("../models/TeamPlayer.model"));
const Game_model_1 = __importDefault(require("../models/Game.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const createTeams = (gameId, adminId, names) => __awaiter(void 0, void 0, void 0, function* () {
    const game = yield Game_model_1.default.findById(gameId);
    if (!game)
        throw new Error('Game not found');
    if (game.adminId.toString() !== adminId)
        throw new Error('Unauthorized');
    const teams = [];
    for (let i = 0; i < names.length; i++) {
        const team = new Team_model_1.default({
            gameId,
            name: names[i],
            order: i
        });
        yield team.save();
        teams.push(team);
    }
    return teams;
});
exports.createTeams = createTeams;
const assignPlayer = (teamId, adminId, playerId) => __awaiter(void 0, void 0, void 0, function* () {
    const team = yield Team_model_1.default.findById(teamId);
    if (!team)
        throw new Error('Team not found');
    const game = yield Game_model_1.default.findById(team.gameId);
    if (!game)
        throw new Error('Game not found');
    if (game.adminId.toString() !== adminId)
        throw new Error('Unauthorized'); // Check if admin is performing action
    const user = yield User_model_1.default.findById(playerId);
    if (!user)
        throw new Error('User not found');
    // Remove player from other teams in this game first (if needed, though not strictly specified, good practice)
    // For now assuming player is free or multiple team assignment not allowed logic handled by UI or simple restriction here.
    // Check if player is already in a team for this game?
    // Let's implement strict: Remove from ANY team in this game first.
    const teamsInGame = yield Team_model_1.default.find({ gameId: game._id });
    const teamIds = teamsInGame.map(t => t._id);
    yield TeamPlayer_model_1.default.deleteMany({ userId: playerId, teamId: { $in: teamIds } });
    const teamPlayer = new TeamPlayer_model_1.default({
        teamId,
        userId: playerId
    });
    yield teamPlayer.save();
    return teamPlayer;
});
exports.assignPlayer = assignPlayer;
const removePlayer = (teamId, adminId, playerId) => __awaiter(void 0, void 0, void 0, function* () {
    const team = yield Team_model_1.default.findById(teamId);
    if (!team)
        throw new Error('Team not found');
    const game = yield Game_model_1.default.findById(team.gameId);
    if (!game)
        throw new Error('Game not found');
    if (game.adminId.toString() !== adminId)
        throw new Error('Unauthorized');
    return yield TeamPlayer_model_1.default.findOneAndDelete({ teamId, userId: playerId });
});
exports.removePlayer = removePlayer;
