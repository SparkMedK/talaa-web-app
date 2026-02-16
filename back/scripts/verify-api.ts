import axios from 'axios';

const API_URL = 'http://localhost:3000';

async function runTest() {
    console.log('--- Starting Verification ---');

    // 1. Create Game
    console.log('\n1. Creating Game...');
    const createGameRes = await axios.post(`${API_URL}/games`, { nickname: 'AdminUser' });
    const gameData: any = createGameRes.data;
    console.log('Game Created:', gameData.game._id);
    console.log('Admin User:', gameData.user._id);

    const gameId = gameData.game._id;
    const adminId = gameData.user._id;

    // 2. Join Game
    console.log('\n2. Joining Game...');
    const joinRes = await axios.post(`${API_URL}/games/${gameId}/join`, { nickname: 'Player2' });
    const playerData: any = joinRes.data;
    console.log('Player 2 Joined:', playerData._id);
    const player2Id = playerData._id;

    // 3. Create Teams
    console.log('\n3. Creating Teams...');
    const teamsRes = await axios.post(`${API_URL}/games/${gameId}/teams`,
        { names: ['Red', 'Blue'] },
        { headers: { 'x-user-id': adminId } }
    );
    const teamsData: any = teamsRes.data;
    console.log('Teams Created:', teamsData.map((t: any) => t.name).join(', '));
    const redTeamId = teamsData.find((t: any) => t.name === 'Red')._id;
    const blueTeamId = teamsData.find((t: any) => t.name === 'Blue')._id;

    // 4. Assign Players
    console.log('\n4. Assigning Players...');
    await axios.post(`${API_URL}/teams/${redTeamId}/assign`,
        { userId: adminId },
        { headers: { 'x-user-id': adminId } }
    );
    console.log('Admin -> Red Team');

    await axios.post(`${API_URL}/teams/${blueTeamId}/assign`,
        { userId: player2Id },
        { headers: { 'x-user-id': adminId } }
    );
    console.log('Player 2 -> Blue Team');

    // 5. Start Game
    console.log('\n5. Starting Game...');
    const startRes = await axios.post(`${API_URL}/games/${gameId}/start`, {}, { headers: { 'x-user-id': adminId } });
    const startGameData: any = startRes.data;
    console.log('Game Status:', startGameData.status);

    // 6. Create Round
    console.log('\n6. Creating Round...');
    const roundRes = await axios.post(`${API_URL}/games/${gameId}/rounds`, {}, { headers: { 'x-user-id': adminId } });
    const roundData: any = roundRes.data;
    console.log('Round Created:', roundData.roundNumber);
    const roundId = roundData._id;

    // 7. Start Turn
    console.log('\n7. Starting Turn...');
    const turnRes = await axios.post(`${API_URL}/rounds/${roundId}/turns/start`, {}, { headers: { 'x-user-id': adminId } });
    const turnData: any = turnRes.data;
    console.log('Turn Started. Words:', turnData.words);
    const turnId = turnData._id;
    const wordToGuess = turnData.words[0];

    // 8. Submit Guess
    console.log('\n8. Submitting Guess...');
    const guessRes = await axios.post(`${API_URL}/turns/${turnId}/guess`,
        { input: wordToGuess },
        { headers: { 'x-user-id': player2Id } }
    );
    const guessData: any = guessRes.data;
    console.log(`Guess Result (Points: ${guessData.guess.points})`);

    // 9. End Turn
    console.log('\n9. Ending Turn...');
    const endTurnRes = await axios.post(`${API_URL}/turns/${turnId}/end`, {}, { headers: { 'x-user-id': adminId } });
    const endTurnData: any = endTurnRes.data;
    console.log('Turn Status:', endTurnData.status);

    console.log('\n--- Verification Complete ---');
}

runTest().catch((err) => {
    console.error('API Error:', err.response?.data || err.message);
});
