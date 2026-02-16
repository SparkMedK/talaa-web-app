import Guess from '../models/Guess.model';
import Turn from '../models/Turn.model';
import Team from '../models/Team.model';

export const submitGuess = async (turnId: string, userId: string, input: string) => {
    const turn = await Turn.findById(turnId);
    if (!turn) throw new Error('Turn not found');
    if (turn.status !== 'ACTIVE') throw new Error('Turn is not active');

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

        turn.solvedWords.push(turn.words.find(w => w.toLowerCase() === normalizedInput) as string); // Push original casing
        await turn.save();

        // Update Team Score
        await Team.findByIdAndUpdate(turn.teamId, { $inc: { score: points } });

        // Check if all words solved?
        if (turn.solvedWords.length === turn.words.length) {
            turn.status = 'COMPLETED';
            await turn.save();
        }
    }

    const guess = new Guess({
        turnId,
        userId,
        input,
        points
    });
    await guess.save();

    return { guess, turn };
};
