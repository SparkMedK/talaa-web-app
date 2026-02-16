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
exports.submitGuess = void 0;
const Guess_model_1 = __importDefault(require("../models/Guess.model"));
const Turn_model_1 = __importDefault(require("../models/Turn.model"));
const Team_model_1 = __importDefault(require("../models/Team.model"));
const submitGuess = (turnId, userId, input) => __awaiter(void 0, void 0, void 0, function* () {
    const turn = yield Turn_model_1.default.findById(turnId);
    if (!turn)
        throw new Error('Turn not found');
    if (turn.status !== 'ACTIVE')
        throw new Error('Turn is not active');
    // Check if user is the describer? Usually describer describes, teammates guess.
    // Spec doesn't strictly say who guesses, but "Submit a guess for an active turn".
    // Assuming any active player can guess? Or typically only teammates?
    // Let's assume validation: Describer cannot guess.
    if (turn.describerId.toString() === userId) {
        throw new Error('Describer cannot submit guesses');
    }
    // Validations logic
    const normalizedInput = input.trim().toLowerCase();
    const normalizedWords = turn.words.map(w => w.toLowerCase());
    let points = 0;
    if (normalizedWords.includes(normalizedInput)) {
        // Correct guess
        // Check if already solved
        const alreadySolved = turn.solvedWords.map(w => w.toLowerCase()).includes(normalizedInput);
        if (alreadySolved) {
            throw new Error('Word already solved');
        }
        points = 1; // 1 point per word? Defaulting to 1.
        turn.solvedWords.push(turn.words.find(w => w.toLowerCase() === normalizedInput)); // Push original casing
        yield turn.save();
        // Update Team Score
        yield Team_model_1.default.findByIdAndUpdate(turn.teamId, { $inc: { score: points } });
        // Check if all words solved?
        if (turn.solvedWords.length === turn.words.length) {
            turn.status = 'COMPLETED';
            yield turn.save();
        }
    }
    const guess = new Guess_model_1.default({
        turnId,
        userId,
        input,
        points
    });
    yield guess.save();
    return { guess, turn };
});
exports.submitGuess = submitGuess;
