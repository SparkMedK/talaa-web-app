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
exports.authenticate = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        // For endpoints that don't require auth (like creating a game), we might skip this.
        // However, the docs say "All POST requests with game/round/turn modification require x-user-id header."
        // We will apply this middleware to specific routes.
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    try {
        const user = yield User_model_1.default.findById(userId);
        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'Server error during authentication' });
    }
});
exports.authenticate = authenticate;
