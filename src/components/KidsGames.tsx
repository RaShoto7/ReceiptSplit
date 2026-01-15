'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/language';

type GameType = 'menu' | 'tictactoe' | 'memory' | 'coloring' | 'quiz';

export function KidsGames() {
  const { language } = useLanguage();
  const [currentGame, setCurrentGame] = useState<GameType>('menu');

  const games = [
    { id: 'tictactoe' as GameType, name: { fr: 'Morpion', en: 'Tic Tac Toe' }, icon: '⭕', color: 'from-blue-400 to-blue-600' },
    { id: 'memory' as GameType, name: { fr: 'Memory', en: 'Memory' }, icon: '🧠', color: 'from-purple-400 to-purple-600' },
    { id: 'coloring' as GameType, name: { fr: 'Coloriage', en: 'Coloring' }, icon: '🎨', color: 'from-pink-400 to-rose-600' },
    { id: 'quiz' as GameType, name: { fr: 'Quiz Food', en: 'Food Quiz' }, icon: '🍕', color: 'from-amber-400 to-orange-600' },
  ];

  if (currentGame === 'menu') {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎮</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {language === 'fr' ? 'Jeux pour patienter' : 'Games while waiting'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {language === 'fr' ? 'Amuse-toi en attendant !' : 'Have fun while waiting!'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {games.map(game => (
            <button
              key={game.id}
              onClick={() => setCurrentGame(game.id)}
              className={`premium-card rounded-2xl p-6 text-center hover:scale-105 transition-transform active:scale-95`}
            >
              <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl shadow-lg`}>
                {game.icon}
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {game.name[language]}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setCurrentGame('menu')}
        className="flex items-center gap-2 text-blue-500 font-medium mb-4"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {language === 'fr' ? 'Retour aux jeux' : 'Back to games'}
      </button>

      {currentGame === 'tictactoe' && <TicTacToe language={language} />}
      {currentGame === 'memory' && <MemoryGame language={language} />}
      {currentGame === 'coloring' && <ColoringGame language={language} />}
      {currentGame === 'quiz' && <FoodQuiz language={language} />}
    </div>
  );
}

// Tic Tac Toe Game
function TicTacToe({ language }: { language: string }) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);

  const checkWinner = useCallback((squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }, []);

  const handleClick = (i: number) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = isXNext ? '❌' : '⭕';
    setBoard(newBoard);
    setIsXNext(!isXNext);
    setWinner(checkWinner(newBoard));
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const isDraw = !winner && board.every(cell => cell !== null);

  return (
    <div className="premium-card rounded-3xl p-6">
      <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-4">
        {language === 'fr' ? 'Morpion' : 'Tic Tac Toe'}
      </h3>

      <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto mb-4">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-3xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="text-center">
        {winner ? (
          <p className="text-lg font-bold text-emerald-500">
            {winner} {language === 'fr' ? 'gagne !' : 'wins!'}
          </p>
        ) : isDraw ? (
          <p className="text-lg font-bold text-amber-500">
            {language === 'fr' ? 'Match nul !' : 'Draw!'}
          </p>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">
            {language === 'fr' ? 'Tour de' : 'Turn:'} {isXNext ? '❌' : '⭕'}
          </p>
        )}
        <button
          onClick={reset}
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium"
        >
          {language === 'fr' ? 'Rejouer' : 'Play again'}
        </button>
      </div>
    </div>
  );
}

// Memory Game
function MemoryGame({ language }: { language: string }) {
  const emojis = ['🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍩', '🍪'];
  const [cards, setCards] = useState<{ emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map(emoji => ({ emoji, flipped: false, matched: false }));
    setCards(shuffled);
  }, []);

  const handleCardClick = (index: number) => {
    if (flippedIndexes.length === 2 || cards[index].flipped || cards[index].matched) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndexes, index];
    setFlippedIndexes(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].matched = true;
          matchedCards[second].matched = true;
          setCards(matchedCards);
          setFlippedIndexes([]);
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].flipped = false;
          resetCards[second].flipped = false;
          setCards(resetCards);
          setFlippedIndexes([]);
        }, 1000);
      }
    }
  };

  const isWon = cards.length > 0 && cards.every(c => c.matched);

  const reset = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map(emoji => ({ emoji, flipped: false, matched: false }));
    setCards(shuffled);
    setFlippedIndexes([]);
    setMoves(0);
  };

  return (
    <div className="premium-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Memory</h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {language === 'fr' ? 'Coups' : 'Moves'}: {moves}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={() => handleCardClick(i)}
            className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${
              card.flipped || card.matched
                ? 'bg-white dark:bg-slate-700 rotate-0'
                : 'bg-gradient-to-br from-purple-500 to-indigo-600 rotate-180'
            } ${card.matched ? 'opacity-50' : ''}`}
          >
            {(card.flipped || card.matched) && card.emoji}
          </button>
        ))}
      </div>

      {isWon && (
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-500 mb-2">
            🎉 {language === 'fr' ? 'Bravo !' : 'Well done!'}
          </p>
          <button onClick={reset} className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium">
            {language === 'fr' ? 'Rejouer' : 'Play again'}
          </button>
        </div>
      )}
    </div>
  );
}

// Coloring Game
function ColoringGame({ language }: { language: string }) {
  const [selectedColor, setSelectedColor] = useState('#ef4444');
  const [filledAreas, setFilledAreas] = useState<Record<string, string>>({});

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

  const areas = [
    { id: 'pizza', path: 'M50,10 L90,90 L10,90 Z', label: '🍕' },
    { id: 'burger', path: 'M110,20 L190,20 L190,80 L110,80 Z', label: '🍔' },
    { id: 'fries', path: 'M210,30 L280,30 L270,90 L220,90 Z', label: '🍟' },
    { id: 'drink', path: 'M50,110 L90,110 L80,190 L60,190 Z', label: '🥤' },
    { id: 'cake', path: 'M110,120 L190,120 L190,180 L110,180 Z', label: '🍰' },
    { id: 'star', path: 'M245,110 L255,140 L290,140 L260,160 L275,190 L245,170 L215,190 L230,160 L200,140 L235,140 Z', label: '⭐' },
  ];

  const handleAreaClick = (areaId: string) => {
    setFilledAreas({ ...filledAreas, [areaId]: selectedColor });
  };

  const reset = () => setFilledAreas({});

  return (
    <div className="premium-card rounded-3xl p-6">
      <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-4">
        {language === 'fr' ? 'Coloriage' : 'Coloring'}
      </h3>

      {/* Color palette */}
      <div className="flex justify-center gap-2 mb-4">
        {colors.map(color => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`w-8 h-8 rounded-full transition-transform ${
              selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : ''
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Canvas */}
      <svg viewBox="0 0 300 200" className="w-full h-48 bg-white dark:bg-slate-800 rounded-2xl">
        {areas.map(area => (
          <path
            key={area.id}
            d={area.path}
            fill={filledAreas[area.id] || '#f1f5f9'}
            stroke="#94a3b8"
            strokeWidth="2"
            onClick={() => handleAreaClick(area.id)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          />
        ))}
      </svg>

      <button
        onClick={reset}
        className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
      >
        {language === 'fr' ? 'Effacer tout' : 'Clear all'}
      </button>
    </div>
  );
}

// Food Quiz
function FoodQuiz({ language }: { language: string }) {
  const questions = [
    {
      q: { fr: 'Quel pays a inventé la pizza ?', en: 'Which country invented pizza?' },
      options: ['🇫🇷 France', '🇮🇹 Italie/Italy', '🇺🇸 USA', '🇯🇵 Japon/Japan'],
      answer: 1,
    },
    {
      q: { fr: 'Combien de pattes a une araignée ?', en: 'How many legs does a spider have?' },
      options: ['4', '6', '8', '10'],
      answer: 2,
    },
    {
      q: { fr: 'Quelle est la couleur du soleil ?', en: 'What color is the sun?' },
      options: ['🔴 Rouge/Red', '🟡 Jaune/Yellow', '🔵 Bleu/Blue', '🟢 Vert/Green'],
      answer: 1,
    },
    {
      q: { fr: 'Quel fruit est jaune et courbé ?', en: 'Which fruit is yellow and curved?' },
      options: ['🍎 Pomme/Apple', '🍊 Orange', '🍌 Banane/Banana', '🍇 Raisin/Grape'],
      answer: 2,
    },
  ];

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (index: number) => {
    if (answered !== null) return;
    setAnswered(index);
    if (index === questions[currentQ].answer) {
      setScore(s => s + 1);
    }
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(c => c + 1);
        setAnswered(null);
      } else {
        setFinished(true);
      }
    }, 1000);
  };

  const reset = () => {
    setCurrentQ(0);
    setScore(0);
    setAnswered(null);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="premium-card rounded-3xl p-6 text-center">
        <div className="text-5xl mb-4">
          {score === questions.length ? '🏆' : score >= questions.length / 2 ? '🎉' : '💪'}
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {language === 'fr' ? 'Quiz terminé !' : 'Quiz finished!'}
        </h3>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          {score}/{questions.length} {language === 'fr' ? 'bonnes réponses' : 'correct'}
        </p>
        <button onClick={reset} className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium">
          {language === 'fr' ? 'Rejouer' : 'Play again'}
        </button>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="premium-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {currentQ + 1}/{questions.length}
        </span>
        <span className="text-sm font-bold text-emerald-500">
          {language === 'fr' ? 'Score' : 'Score'}: {score}
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 text-center">
        {q.q[language as 'fr' | 'en']}
      </h3>

      <div className="space-y-2">
        {q.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={answered !== null}
            className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
              answered === null
                ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                : i === q.answer
                  ? 'bg-emerald-500 text-white'
                  : answered === i
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 opacity-50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
