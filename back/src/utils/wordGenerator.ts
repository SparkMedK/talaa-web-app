export const generateWords = (count: number = 5): string[] => {
    const wordList = [
        'Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew',
        'Ice', 'Jackfruit', 'Kiwi', 'Lemon', 'Mango', 'Nectarine', 'Orange', 'Papaya',
        'Quince', 'Raspberry', 'Strawberry', 'Tangerine', 'Ugli', 'Vanilla', 'Watermelon',
        'Xigua', 'Yam', 'Zucchini', 'Car', 'Bus', 'Train', 'Plane', 'Bike', 'Ship', 'Boat'
    ];

    const shuffled = wordList.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
