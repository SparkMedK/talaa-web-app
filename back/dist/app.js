"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const game_routes_1 = __importDefault(require("./routes/game.routes"));
const team_routes_1 = __importDefault(require("./routes/team.routes"));
const round_routes_1 = __importDefault(require("./routes/round.routes"));
const guess_routes_1 = __importDefault(require("./routes/guess.routes"));
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/games', game_routes_1.default);
app.use('/', team_routes_1.default); // Note: Team routes are mounted at root because some are nested under /games and some are not, handled in router
app.use('/', round_routes_1.default);
app.use('/', guess_routes_1.default);
exports.default = app;
