// 游戏状态管理
const gameState = {
    mode: null, // 'calculation' 或 'challenge' 或 'practice'
    selectedCards: [],
    randomCards: [],
    timerInterval: null,
    startTime: null,
    score: 0,
    solutions: []
};

// DOM 元素
const elements = {
    gameModeSelection: document.querySelector('.game-mode-selection'),
    gameArea: document.getElementById('game-area'),
    calculationArea: document.getElementById('calculation-area'),
    challengeArea: document.getElementById('challenge-area'),
    backButton: document.getElementById('back-button'),
    calculationResult: document.getElementById('calculation-result'),
    challengeResult: document.getElementById('challenge-result'),
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    calculationInput: document.getElementById('calculation-input'),
    virtualKeyboard: document.querySelector('.virtual-keyboard'),
    cardButtons: document.querySelectorAll('.card-btn'),
    operatorButtons: document.querySelectorAll('.op-btn'),
    bracketButtons: document.querySelectorAll('.bracket-btn'),
    backspaceButton: document.getElementById('backspace-btn'),
    clearButton: document.getElementById('clear-btn')
};

// ========== 平方模式 独立状态管理 ==========
const squareState = {
    mode: false,
    randomCards: [],
    timerInterval: null,
    startTime: null,
    score: 0,
    solutions: [],
    usedSquare: {}, // 记录每个数字是否已平方
};

// ========== 平方模式 DOM 元素 ==========
const squareElements = {
    area: document.getElementById('square-area'),
    timer: document.getElementById('square-timer'),
    score: document.getElementById('square-score'),
    input: document.getElementById('square-calculation-input'),
    keyboard: document.querySelector('.square-virtual-keyboard'),
    cardButtons: document.querySelectorAll('.square-card-btn'),
    opButtons: document.querySelectorAll('.square-op-btn'),
    bracketButtons: document.querySelectorAll('.square-bracket-btn'),
    squareBtn: document.querySelector('.square-btn'),
    backspaceBtn: document.getElementById('square-backspace-btn'),
    clearBtn: document.getElementById('square-clear-btn'),
    newChallengeBtn: document.getElementById('new-square-challenge'),
    showSolutionBtn: document.getElementById('show-square-solution'),
    result: document.getElementById('square-challenge-result'),
    randomCardsContainer: document.querySelector('.square-random-cards > div'),
};

// ========== 练习模式 独立状态管理 ==========
const practiceState = {
    mode: false,
    randomCards: [],
    timerInterval: null,
    startTime: null,
    score: 0,
    solutions: [],
    hintShown: false,
    selectedMethod: 'all', // 当前选择的解法类型：'all', 'difference', 'elimination-zero', 'elimination-one', 'fixed-factor'
};

// ========== 练习模式 DOM 元素 ==========
const practiceElements = {
    area: document.getElementById('practice-area'),
    timer: document.getElementById('practice-timer'),
    score: document.getElementById('practice-score'),
    input: document.getElementById('practice-calculation-input'),
    keyboard: document.querySelector('.practice-virtual-keyboard'),
    cardButtons: document.querySelectorAll('.practice-card-btn'),
    opButtons: document.querySelectorAll('.practice-op-btn'),
    bracketButtons: document.querySelectorAll('.practice-bracket-btn'),
    backspaceBtn: document.getElementById('practice-backspace-btn'),
    clearBtn: document.getElementById('practice-clear-btn'),
    newChallengeBtn: document.getElementById('new-practice-challenge'),
    showSolutionBtn: document.getElementById('show-practice-solution'),
    showHintBtn: document.getElementById('show-practice-hint'),
    result: document.getElementById('practice-result'),
    randomCardsContainer: document.querySelector('.practice-random-cards > div'),
    hintArea: document.querySelector('.practice-hint'),
};

// 按钮事件监听
document.getElementById('calculation-mode').addEventListener('click', () => setGameMode('calculation'));
document.getElementById('challenge-mode').addEventListener('click', () => setGameMode('challenge'));
document.getElementById('square-mode').addEventListener('click', () => setSquareMode(true));
document.getElementById('practice-mode').addEventListener('click', () => setPracticeMode(true));
document.getElementById('calculate-btn').addEventListener('click', calculateSolutions);
document.getElementById('new-challenge').addEventListener('click', startNewChallenge);
document.getElementById('show-solution').addEventListener('click', showSolution);
document.getElementById('submit-calculation').addEventListener('click', checkUserSolution);
elements.backButton.querySelector('button').addEventListener('click', backToModeSelection);

// 清空已选牌按钮事件监听
document.addEventListener('DOMContentLoaded', function() {
    const clearSelectedCardsBtn = document.getElementById('clear-selected-cards');
    if (clearSelectedCardsBtn) {
        clearSelectedCardsBtn.addEventListener('click', resetCalculationMode);
    }
});

// 虚拟键盘事件监听
document.addEventListener('DOMContentLoaded', () => {
    // 卡片按钮点击事件
    document.querySelectorAll('.card-btn').forEach(button => {
        button.addEventListener('click', () => handleVirtualKeyboardInput('card', button.dataset.value));
    });
    
    // 运算符按钮点击事件
    document.querySelectorAll('.op-btn').forEach(button => {
        button.addEventListener('click', () => handleVirtualKeyboardInput('operator', button.dataset.op));
    });
    
    // 括号按钮点击事件
    document.querySelectorAll('.bracket-btn').forEach(button => {
        button.addEventListener('click', () => handleVirtualKeyboardInput('bracket', button.dataset.bracket));
    });
    
    // 退格按钮点击事件
    document.getElementById('backspace-btn').addEventListener('click', handleBackspace);
    
    // 清空按钮点击事件
    document.getElementById('clear-btn').addEventListener('click', clearCalculationInput);
});

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);

// 初始化游戏
function initGame() {
    // 生成所有可能的牌
    const cardSelectionGrid = document.querySelector('.card-selection .grid');
    if (cardSelectionGrid) {
        generateAllCards(cardSelectionGrid);
    }
    
    // 添加卡片点击事件
    document.addEventListener('click', function(e) {
        if (e.target.closest('.card')) {
            const card = e.target.closest('.card');
            handleCardClick(card);
        }
    });
    
    // 初始化计算按钮状态
    updateCalculateButtonState();
    
    // 初始化练习模式事件监听
    initPracticeMode();
}

// 设置游戏模式
function setGameMode(mode) {
    gameState.mode = mode;
    elements.gameModeSelection.classList.add('hidden');
    elements.gameArea.classList.remove('hidden');
    elements.backButton.classList.remove('hidden');
    // 切换模式时隐藏平方模式区域
    if (typeof squareElements !== 'undefined' && squareElements.area) {
        squareElements.area.classList.add('hidden');
    }
    // 切换模式时隐藏练习模式区域
    if (typeof practiceElements !== 'undefined' && practiceElements.area) {
        practiceElements.area.classList.add('hidden');
    }
    if (mode === 'calculation') {
        elements.calculationArea.classList.remove('hidden');
        elements.challengeArea.classList.add('hidden');
        resetCalculationMode();
    } else if (mode === 'challenge') {
        elements.calculationArea.classList.add('hidden');
        elements.challengeArea.classList.remove('hidden');
        startNewChallenge();
    }
}

// 返回模式选择
function backToModeSelection() {
    // 停止计时器
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    // 停止平方模式计时器
    if (squareState.timerInterval) {
        clearInterval(squareState.timerInterval);
        squareState.timerInterval = null;
    }
    
    // 停止练习模式计时器
    if (practiceState.timerInterval) {
        clearInterval(practiceState.timerInterval);
        practiceState.timerInterval = null;
    }
    
    // 重置游戏状态
    gameState.selectedCards = [];
    gameState.randomCards = [];
    gameState.solutions = [];
    
    // 隐藏游戏区域，显示模式选择
    elements.gameArea.classList.add('hidden');
    elements.calculationArea.classList.add('hidden');
    elements.challengeArea.classList.add('hidden');
    elements.backButton.classList.add('hidden');
    elements.gameModeSelection.classList.remove('hidden');
    
    // 隐藏平方模式区域
    if (typeof squareElements !== 'undefined' && squareElements.area) {
        squareElements.area.classList.add('hidden');
    }
    
    // 隐藏练习模式区域
    if (typeof practiceElements !== 'undefined' && practiceElements.area) {
        practiceElements.area.classList.add('hidden');
    }
    
    // 隐藏结果区域
    elements.calculationResult.classList.add('hidden');
    elements.challengeResult.classList.add('hidden');
}

// 生成所有可能的牌
function generateAllCards(container) {
    // 按照方块(♦)、梅花(♣)、红心(♥)、黑桃(♠)的顺序排列
    const suits = [
        { symbol: '♦', color: 'red' },
        { symbol: '♣', color: 'black' },
        { symbol: '♥', color: 'red' },
        { symbol: '♠', color: 'black' }
    ];
    
    const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
    
    suits.forEach(suit => {
        values.forEach(value => {
            const card = createCardElement(value, suit.symbol, suit.color);
            container.appendChild(card);
        });
    });
}

// 创建卡片元素
function createCardElement(value, suit, color) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.value = value;
    card.dataset.suit = suit;
    
    const valueElement = document.createElement('div');
    valueElement.className = 'card-value';
    valueElement.textContent = value;
    
    const suitElement = document.createElement('div');
    suitElement.className = `card-suit ${color}`;
    suitElement.textContent = suit;
    
    card.appendChild(valueElement);
    card.appendChild(suitElement);
    
    return card;
}

// 处理卡片点击事件
function handleCardClick(card) {
    // 只在计算模式下处理卡片选择
    if (gameState.mode !== 'calculation') return;
    
    const value = card.dataset.value;
    const suit = card.dataset.suit;
    
    // 检查卡片是否已经被选中
    const isSelected = card.classList.contains('selected');
    
    if (isSelected) {
        // 取消选中
        card.classList.remove('selected');
        gameState.selectedCards = gameState.selectedCards.filter(c => !(c.value === value && c.suit === suit));
    } else {
        // 如果已经选了4张牌，不能再选
        if (gameState.selectedCards.length >= 4) return;
        
        // 选中卡片
        card.classList.add('selected');
        gameState.selectedCards.push({ value, suit });
    }
    
    // 更新已选牌区域
    updateSelectedCardsDisplay();
    
    // 更新计算按钮状态
    updateCalculateButtonState();
}

// 更新已选牌展示
function updateSelectedCardsDisplay() {
    const selectedCardsContainer = document.querySelector('.selected-cards > div:last-child');
    if (!selectedCardsContainer) return;
    
    selectedCardsContainer.innerHTML = '';
    
    gameState.selectedCards.forEach(card => {
        const cardElement = createCardElement(card.value, card.suit, card.suit === '♥' || card.suit === '♦' ? 'red' : 'black');
        selectedCardsContainer.appendChild(cardElement);
    });
}

// 更新计算按钮状态
function updateCalculateButtonState() {
    const calculateBtn = document.getElementById('calculate-btn');
    calculateBtn.disabled = gameState.selectedCards.length !== 4;
}

// 重置计算模式
function resetCalculationMode() {
    // 清除已选牌
    gameState.selectedCards = [];
    
    // 清除已选中的卡片样式
    document.querySelectorAll('.card.selected').forEach(card => {
        card.classList.remove('selected');
    });
    
    // 更新已选牌区域
    updateSelectedCardsDisplay();
    
    // 更新计算按钮状态
    updateCalculateButtonState();
    
    // 隐藏结果区域
    elements.calculationResult.classList.add('hidden');
}

// 开始新的挑战
function startNewChallenge() {
    // 停止之前的计时器
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // 生成随机4张牌并确保有解
    let hasValidSolution = false;
    let attempts = 0;
    const maxAttempts = 100; // 设置最大尝试次数，防止无限循环
    
    while (!hasValidSolution && attempts < maxAttempts) {
        // 生成随机4张牌
        gameState.randomCards = generateRandomCards(4);
        
        // 计算解法
        gameState.solutions = findAllSolutions(gameState.randomCards.map(card => cardValueToNumber(card.value)));
        
        // 检查是否有解
        if (gameState.solutions.length > 0) {
            hasValidSolution = true;
        }
        
        attempts++;
    }
    
    // 显示随机牌
    displayRandomCards();
    
    // 更新虚拟键盘上的牌值按钮显示
    updateCardButtonsDisplay();
    
    // 重置计时器
    resetTimer();
    
    // 清空输入框
    clearCalculationInput();
    
    // 隐藏结果区域
    elements.challengeResult.classList.add('hidden');
    
    // 重置卡片按钮状态
    resetCardButtonsState();
}

// 处理虚拟键盘输入
function handleVirtualKeyboardInput(type, value) {
    const input = elements.calculationInput;
    
    if (type === 'card') {
        // 检查该卡片是否已被使用
        const cardButtons = document.querySelectorAll('.card-btn');
        const clickedButton = Array.from(cardButtons).find(btn => btn.dataset.value === value);
        
        if (clickedButton && !clickedButton.classList.contains('used')) {
            // 获取按钮上显示的实际牌值而非ABCD
            const actualCardValue = clickedButton.textContent;
            input.value += actualCardValue;
            clickedButton.classList.add('used');
        }
    } else if (type === 'operator') {
        // 添加运算符
        input.value += value;
    } else if (type === 'bracket') {
        // 添加括号
        input.value += value;
    }
    
    // 实时检查表达式是否完整有效
    checkExpressionCompleteness();
}

// 处理退格按钮
function handleBackspace() {
    const input = elements.calculationInput;
    if (input.value.length > 0) {
        const lastChar = input.value.charAt(input.value.length - 1);
        
        // 检查是否删除了牌值
        // 需要检查所有可能的牌值：数字、A、J、Q、K
        const cardButtons = document.querySelectorAll('.card-btn');
        const lastCharIsCard = Array.from(cardButtons).some(btn => {
            // 检查按钮上显示的文本是否与最后一个字符匹配
            if (btn.textContent === lastChar && btn.classList.contains('used')) {
                btn.classList.remove('used');
                return true;
            }
            return false;
        });
        
        // 处理多位数字的情况（如10）
        if (!lastCharIsCard && lastChar === '0' && input.value.length >= 2) {
            const lastTwoChars = input.value.slice(-2);
            if (lastTwoChars === '10') {
                const cardButton = Array.from(cardButtons).find(btn => 
                    btn.textContent === '10' && btn.classList.contains('used')
                );
                if (cardButton) {
                    cardButton.classList.remove('used');
                    // 删除两个字符（'10'）
                    input.value = input.value.slice(0, -2);
                    return;
                }
            }
        }
        
        // 删除最后一个字符
        input.value = input.value.slice(0, -1);
    }
}

// 清空计算输入
function clearCalculationInput() {
    elements.calculationInput.value = '';
    resetCardButtonsState();
}

// 检查表达式完整性并自动提交
function checkExpressionCompleteness() {
    // 只在挑战模式下启用自动提交
    if (gameState.mode !== 'challenge') return;
    
    const userInput = elements.calculationInput.value.trim();
    if (!userInput) return;
    
    try {
        // 检查是否使用了所有4张牌
        const usedCards = [];
        let checkExpression = userInput;
        let allCardsUsed = true;
        
        for (const card of gameState.randomCards) {
            const cardValue = card.value;
            // 创建一个正则表达式来匹配完整的牌值
            const cardRegex = new RegExp('\\b' + cardValue + '\\b');
            if (checkExpression.match(cardRegex)) {
                usedCards.push(cardValue);
                checkExpression = checkExpression.replace(cardRegex, 'x'); // 替换为x，防止重复计数
            }
        }
        
        // 检查是否使用了所有4张牌
        if (usedCards.length === 4) {
            // 检查表达式是否有效（括号匹配等）
            if (isValidExpression(userInput)) {
                // 自动提交
                checkUserSolution();
            }
        }
    } catch (error) {
        // 表达式不完整或无效，不进行提交
        return;
    }
}

// 重置卡片按钮状态
function resetCardButtonsState() {
    document.querySelectorAll('.card-btn').forEach(button => {
        button.classList.remove('used');
    });
}

// 更新虚拟键盘上的牌值按钮显示
function updateCardButtonsDisplay() {
    // 获取所有牌值按钮
    const cardButtons = document.querySelectorAll('.card-btn');
    
    // 更新每个按钮的显示文本为对应的牌值
    cardButtons.forEach((button, index) => {
        if (index < gameState.randomCards.length) {
            // 保持data-value属性为ABCD，但显示文本为实际牌值
            const cardValue = gameState.randomCards[index].value;
            button.textContent = cardValue;
        }
    });
}

// 生成随机牌
function generateRandomCards(count) {
    const suits = ['♥', '♦', '♠', '♣'];
    const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
    const cards = [];
    
    for (let i = 0; i < count; i++) {
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        const color = (suit === '♥' || suit === '♦') ? 'red' : 'black';
        cards.push({ value, suit, color });
    }
    
    return cards;
}

// 显示随机牌
function displayRandomCards() {
    const randomCardsContainer = document.querySelector('.random-cards > div');
    randomCardsContainer.innerHTML = '';
    
    gameState.randomCards.forEach(card => {
        const cardElement = createCardElement(card.value, card.suit, card.color);
        randomCardsContainer.appendChild(cardElement);
    });
}

// 重置计时器
function resetTimer() {
    gameState.startTime = new Date();
    elements.timer.textContent = '00:00';
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(updateTimer, 1000);
}

// 更新计时器
function updateTimer() {
    const now = new Date();
    const elapsed = Math.floor((now - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    elements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 卡片值转数字
function cardValueToNumber(value) {
    const valueMap = {
        'A': 1,
        'J': 11,
        'Q': 12,
        'K': 13
    };
    
    return valueMap[value] || parseInt(value);
}

// 显示计算结果
function displayCalculationResult(solutions) {
    const resultContainer = elements.calculationResult;
    resultContainer.innerHTML = '';
    resultContainer.classList.remove('hidden', 'success', 'error', 'warning');
    
    if (solutions.length === 0) {
        resultContainer.classList.add('error');
        resultContainer.innerHTML = `
            <div class="flex items-start">
                <div class="text-error-color text-xl mr-3"><i class="fas fa-times-circle"></i></div>
                <div>
                    <h3 class="text-lg font-medium text-gray-800 mb-1">无解</h3>
                    <p class="text-gray-600">这组牌无法通过四则运算得到24点。</p>
                </div>
            </div>
        `;
    } else {
        resultContainer.classList.add('success');
        
        const solutionCount = solutions.length > 10 ? 10 : solutions.length;
        const hasMoreSolutions = solutions.length > 10;
        
        let html = `
            <div class="flex items-start">
                <div class="text-success-color text-xl mr-3"><i class="fas fa-check-circle"></i></div>
                <div class="w-full">
                    <h3 class="text-lg font-medium text-gray-800 mb-1">找到 ${solutions.length} 种解法</h3>
                    <p class="text-gray-600 mb-3">以下是${hasMoreSolutions ? '部分' : '所有'}可能的解法：</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        `;
        
        for (let i = 0; i < solutionCount; i++) {
            html += `<div class="solution">${solutions[i]}</div>`;
        }
        
        html += `
                    </div>
                    ${hasMoreSolutions ? `<p class="text-sm text-gray-500 mt-2">还有 ${solutions.length - 10} 种解法未显示</p>` : ''}
                </div>
            </div>
        `;
        
        resultContainer.innerHTML = html;
    }
}

// 显示挑战模式的解法
function showSolution() {
    const resultContainer = elements.challengeResult;
    resultContainer.innerHTML = '';
    resultContainer.classList.remove('hidden', 'success', 'error', 'warning');
    
    if (gameState.solutions.length === 0) {
        resultContainer.classList.add('error');
        resultContainer.innerHTML = `
            <div class="flex items-start">
                <div class="text-error-color text-xl mr-3"><i class="fas fa-times-circle"></i></div>
                <div>
                    <h3 class="text-lg font-medium text-gray-800 mb-1">无解</h3>
                    <p class="text-gray-600">这组牌无法通过四则运算得到24点。</p>
                </div>
            </div>
        `;
    } else {
        resultContainer.classList.add('warning');
        
        const solutionCount = gameState.solutions.length > 5 ? 5 : gameState.solutions.length;
        const hasMoreSolutions = gameState.solutions.length > 5;
        
        let html = `
            <div class="flex items-start">
                <div class="text-warning-color text-xl mr-3"><i class="fas fa-lightbulb"></i></div>
                <div class="w-full">
                    <h3 class="text-lg font-medium text-gray-800 mb-1">解法提示</h3>
                    <p class="text-gray-600 mb-3">以下是${hasMoreSolutions ? '部分' : '所有'}可能的解法：</p>
                    <div class="grid grid-cols-1 gap-2">
        `;
        
        for (let i = 0; i < solutionCount; i++) {
            html += `<div class="solution">${gameState.solutions[i]} = 24</div>`;
        }
        
        html += `
                    </div>
                    ${hasMoreSolutions ? `<p class="text-sm text-gray-500 mt-2">还有 ${gameState.solutions.length - 5} 种解法未显示</p>` : ''}
                </div>
            </div>
        `;
        
        resultContainer.innerHTML = html;
    }
    
    resultContainer.classList.remove('hidden');
}

// 检查用户输入的解法
function checkUserSolution() {
    const userInput = elements.calculationInput.value.trim();
    if (!userInput) return;
    
    const resultContainer = elements.challengeResult;
    resultContainer.innerHTML = '';
    resultContainer.classList.remove('hidden', 'success', 'error', 'warning');
    
    try {
        // 用户已经直接输入了实际牌值，不需要替换ABCD
        let expression = userInput;
        
        // 替换字母牌面为对应的数值用于计算
        let evalExpression = expression.replace(/A/g, '1').replace(/J/g, '11').replace(/Q/g, '12').replace(/K/g, '13');
        
        // 检查是否使用了所有4张牌
        const usedCards = [];
        let checkExpression = expression;
        for (const card of gameState.randomCards) {
            const cardValue = card.value;
            // 创建一个正则表达式来匹配完整的牌值
            const cardRegex = new RegExp('\\b' + cardValue + '\\b');
            if (checkExpression.match(cardRegex)) {
                usedCards.push(cardValue);
                checkExpression = checkExpression.replace(cardRegex, 'x'); // 替换为x，防止重复计数
            }
        }
        
        if (usedCards.length !== 4) {
            throw new Error('必须使用所有4张牌，每张牌只能使用一次');
        }
        
        // 计算表达式
        // 注意：这里使用eval仅用于演示，实际应用中应使用更安全的方法
        const result = eval(evalExpression);
        
        if (Math.abs(result - 24) < 0.0001) {
            // 正确答案
            resultContainer.classList.add('success');
            resultContainer.innerHTML = `
                <div class="flex items-start">
                    <div class="text-success-color text-xl mr-3"><i class="fas fa-check-circle"></i></div>
                    <div>
                        <h3 class="text-lg font-medium text-gray-800 mb-1">恭喜！</h3>
                        <p class="text-gray-600">您的解法 ${userInput} = 24 是正确的！</p>
                    </div>
                </div>
            `;
            
            // 增加分数
            gameState.score += 10;
            elements.score.textContent = gameState.score;
            
            // 播放成功音效
            if (typeof playSuccessSound === 'function') {
                playSuccessSound();
            }
            
            // 显示祝贺动效
            showCongratulationEffect();
            
            // 2秒后开始新的挑战
            setTimeout(() => {
                startNewChallenge();
            }, 2000);
        } else {
            // 错误答案
            resultContainer.classList.add('error');
            resultContainer.innerHTML = `
                <div class="flex items-start">
                    <div class="text-error-color text-xl mr-3"><i class="fas fa-times-circle"></i></div>
                    <div>
                        <h3 class="text-lg font-medium text-gray-800 mb-1">计算错误</h3>
                        <p class="text-gray-600">您的解法 ${userInput} = ${result.toFixed(2)}，不等于24</p>
                    </div>
                </div>
            `;
            
            // 播放错误音效
            if (typeof playErrorSound === 'function') {
                playErrorSound();
            }
        }
    } catch (error) {
        // 处理错误
        resultContainer.classList.add('error');
        resultContainer.innerHTML = `
            <div class="flex items-start">
                <div class="text-error-color text-xl mr-3"><i class="fas fa-exclamation-circle"></i></div>
                <div>
                    <h3 class="text-lg font-medium text-gray-800 mb-1">输入错误</h3>
                    <p class="text-gray-600">${error.message || '表达式格式不正确，请检查您的输入'}</p>
                </div>
            </div>
        `;
        
        // 播放错误音效
        if (typeof playErrorSound === 'function') {
            playErrorSound();
        }
    }
    
    resultContainer.classList.remove('hidden');
}

// 计算24点解法
function calculateSolutions() {
    // 获取已选牌的数值
    const numbers = gameState.selectedCards.map(card => cardValueToNumber(card.value));
    
    // 查找所有解法
    const solutions = findAllSolutions(numbers);
    
    // 显示结果
    displayCalculationResult(solutions);
}

// 查找所有24点解法
function findAllSolutions(numbers) {
    if (numbers.length !== 4) return [];
    
    const solutions = [];
    const ops = ['+', '-', '*', '/'];
    
    // 生成所有可能的数字排列
    const permutations = generatePermutations(numbers);
    
    // 对每种排列，尝试所有可能的运算符组合
    permutations.forEach(perm => {
        // 尝试所有可能的运算符组合
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                for (let k = 0; k < 4; k++) {
                    // 尝试所有可能的括号组合，遵循标准数学表达式规则
                    
                    // 1. 基本括号组合：(a op b) op (c op d)
                    try {
                        let result = calculate(calculate(perm[0], ops[i], perm[1]), ops[j], calculate(perm[2], ops[k], perm[3]));
                        if (Math.abs(result - 24) < 0.0001) {
                            // 根据运算符优先级决定是否需要括号
                            let leftPart = needBrackets(ops[i], ops[j]) ? `(${perm[0]} ${ops[i]} ${perm[1]})` : `${perm[0]} ${ops[i]} ${perm[1]}`;
                            let rightPart = needBrackets(ops[k], ops[j]) ? `(${perm[2]} ${ops[k]} ${perm[3]})` : `${perm[2]} ${ops[k]} ${perm[3]}`;
                            solutions.push(`${leftPart} ${ops[j]} ${rightPart}`);
                        }
                    } catch (e) {}
                    
                    // 2. 嵌套括号组合：((a op b) op c) op d
                    try {
                        let result = calculate(calculate(calculate(perm[0], ops[i], perm[1]), ops[j], perm[2]), ops[k], perm[3]);
                        if (Math.abs(result - 24) < 0.0001) {
                            let innerPart = needBrackets(ops[i], ops[j]) ? `(${perm[0]} ${ops[i]} ${perm[1]})` : `${perm[0]} ${ops[i]} ${perm[1]}`;
                            let middlePart = needBrackets(ops[j], ops[k]) ? `((${innerPart}) ${ops[j]} ${perm[2]})` : `${innerPart} ${ops[j]} ${perm[2]}`;
                            solutions.push(`${middlePart} ${ops[k]} ${perm[3]}`);
                        }
                    } catch (e) {}
                    
                    // 3. 嵌套括号组合：a op ((b op c) op d)
                    try {
                        let result = calculate(perm[0], ops[i], calculate(calculate(perm[1], ops[j], perm[2]), ops[k], perm[3]));
                        if (Math.abs(result - 24) < 0.0001) {
                            let innerPart = needBrackets(ops[j], ops[k]) ? `(${perm[1]} ${ops[j]} ${perm[2]})` : `${perm[1]} ${ops[j]} ${perm[2]}`;
                            let rightPart = needBrackets(ops[k], ops[i]) ? `((${innerPart}) ${ops[k]} ${perm[3]})` : `${innerPart} ${ops[k]} ${perm[3]}`;
                            solutions.push(`${perm[0]} ${ops[i]} ${rightPart}`);
                        }
                    } catch (e) {}
                    
                    // 4. 双层嵌套：a op (b op (c op d))
                    try {
                        let result = calculate(perm[0], ops[i], calculate(perm[1], ops[j], calculate(perm[2], ops[k], perm[3])));
                        if (Math.abs(result - 24) < 0.0001) {
                            let innerPart = needBrackets(ops[k], ops[j]) ? `(${perm[2]} ${ops[k]} ${perm[3]})` : `${perm[2]} ${ops[k]} ${perm[3]}`;
                            let rightPart = needBrackets(ops[j], ops[i]) ? `(${perm[1]} ${ops[j]} ${innerPart})` : `${perm[1]} ${ops[j]} ${innerPart}`;
                            solutions.push(`${perm[0]} ${ops[i]} ${rightPart}`);
                        }
                    } catch (e) {}
                }
            }
        }
    });
    
    // 去除重复解法并排序，优先展示更简洁的解法
    return [...new Set(solutions)].sort((a, b) => {
        // 优先展示括号较少的解法
        const bracketsA = (a.match(/[()]/g) || []).length;
        const bracketsB = (b.match(/[()]/g) || []).length;
        return bracketsA - bracketsB;
    });
}

// 判断是否需要括号
function needBrackets(innerOp, outerOp) {
    // 定义运算符优先级
    const precedence = {
        '*': 2,
        '/': 2,
        '+': 1,
        '-': 1
    };
    
    // 如果外层运算符优先级大于或等于内层运算符优先级，需要括号
    // 对于减法和除法，由于它们不满足交换律，总是需要括号
    return precedence[outerOp] >= precedence[innerOp] || 
           outerOp === '-' || outerOp === '/' ||
           innerOp === '-' || innerOp === '/';
}

// 生成所有可能的排列
function generatePermutations(arr) {
    const result = [];
    
    function permute(arr, m = []) {
        if (arr.length === 0) {
            result.push(m);
        } else {
            for (let i = 0; i < arr.length; i++) {
                const curr = arr.slice();
                const next = curr.splice(i, 1);
                permute(curr, m.concat(next));
            }
        }
    }
    
    permute(arr);
    return result;
}

// 计算两个数的四则运算
function calculate(a, op, b) {
    switch (op) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '*':
            return a * b;
        case '/':
            if (b === 0) throw new Error('除数不能为0');
            return a / b;
        default:
            throw new Error('无效的运算符');
    }
}

// 验证表达式的有效性
function isValidExpression(expression) {
    // 检查括号是否匹配
    let bracketCount = 0;
    for (let i = 0; i < expression.length; i++) {
        if (expression[i] === '(') {
            bracketCount++;
        } else if (expression[i] === ')') {
            bracketCount--;
            // 如果右括号多于左括号，表达式无效
            if (bracketCount < 0) return false;
        }
    }
    // 左右括号数量应该相等
    if (bracketCount !== 0) return false;
    
    // 检查表达式是否包含基本运算符
    if (!(/[\+\-\*\/]/.test(expression))) return false;
    
    // 尝试计算表达式，检查是否可以被解析
    try {
        // 替换字母牌面为对应的数值用于计算
        let evalExpression = expression.replace(/A/g, '1').replace(/J/g, '11').replace(/Q/g, '12').replace(/K/g, '13');
        // 尝试计算，但不关心结果，只检查是否可以计算
        eval(evalExpression);
        return true;
    } catch (error) {
        // 表达式无法计算
        return false;
    }
}

// ========== 平方模式 事件监听 ==========
document.getElementById('square-mode').addEventListener('click', () => setSquareMode(true));
squareElements.newChallengeBtn.addEventListener('click', startNewSquareChallenge);
squareElements.showSolutionBtn.addEventListener('click', showSquareSolution);
squareElements.backspaceBtn.addEventListener('click', squareHandleBackspace);
squareElements.clearBtn.addEventListener('click', clearSquareInput);
squareElements.keyboard.addEventListener('click', squareKeyboardHandler);

function setSquareMode(on) {
    gameState.mode = null;
    squareState.mode = on;
    elements.gameModeSelection.classList.add('hidden');
    elements.gameArea.classList.remove('hidden');
    elements.backButton.classList.remove('hidden');
    elements.calculationArea.classList.add('hidden');
    elements.challengeArea.classList.add('hidden');
    squareElements.area.classList.remove('hidden');
    startNewSquareChallenge();
}

// 返回模式选择时隐藏平方模式
const oldBackToModeSelection = backToModeSelection;
backToModeSelection = function() {
    if (squareState.timerInterval) clearInterval(squareState.timerInterval);
    squareState.mode = false;
    squareState.randomCards = [];
    squareState.solutions = [];
    squareElements.area.classList.add('hidden');
    squareElements.result.classList.add('hidden');
    squareElements.input.value = '';
    squareState.score = 0;
    squareElements.score.textContent = 0;
    oldBackToModeSelection();
};

// ========== 平方模式核心逻辑 ==========
function startNewSquareChallenge() {
    if (squareState.timerInterval) clearInterval(squareState.timerInterval);
    // 生成有解的4张牌，允许平方
    let hasValidSolution = false, attempts = 0, maxAttempts = 100;
    while (!hasValidSolution && attempts < maxAttempts) {
        squareState.randomCards = generateRandomCards(4);
        squareState.solutions = findAllSquareSolutions(squareState.randomCards.map(card => cardValueToNumber(card.value)));
        if (squareState.solutions.length > 0) hasValidSolution = true;
        attempts++;
    }
    displaySquareRandomCards();
    updateSquareCardButtonsDisplay();
    resetSquareTimer();
    clearSquareInput();
    squareElements.result.classList.add('hidden');
    squareState.usedSquare = {};
    squareElements.cardButtons.forEach(btn => btn.classList.remove('used-square'));
}

function displaySquareRandomCards() {
    squareElements.randomCardsContainer.innerHTML = '';
    squareState.randomCards.forEach(card => {
        const cardElement = createCardElement(card.value, card.suit, card.color);
        squareElements.randomCardsContainer.appendChild(cardElement);
    });
}

function updateSquareCardButtonsDisplay() {
    squareElements.cardButtons.forEach((button, idx) => {
        if (idx < squareState.randomCards.length) {
            button.textContent = squareState.randomCards[idx].value;
        }
    });
}

function resetSquareTimer() {
    squareState.startTime = new Date();
    squareElements.timer.textContent = '00:00';
    if (squareState.timerInterval) clearInterval(squareState.timerInterval);
    squareState.timerInterval = setInterval(updateSquareTimer, 1000);
}
function updateSquareTimer() {
    const now = new Date();
    const elapsed = Math.floor((now - squareState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    squareElements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function clearSquareInput() {
    squareElements.input.value = '';
    squareState.usedSquare = {};
    squareElements.cardButtons.forEach(btn => btn.classList.remove('used-square'));
}

function squareKeyboardHandler(e) {
    const t = e.target;
    if (t.classList.contains('square-card-btn')) {
        squareElements.input.value += t.textContent;
    } else if (t.classList.contains('square-op-btn')) {
        squareElements.input.value += t.dataset.op;
    } else if (t.classList.contains('square-bracket-btn')) {
        squareElements.input.value += t.dataset.bracket;
    } else if (t.classList.contains('square-btn')) {
        // 平方按钮，查找最后一个数字并加²
        let v = squareElements.input.value;
        const match = v.match(/(\d+|A|J|Q|K)(?![\d²])/g);
        if (match) {
            const last = match[match.length-1];
            // 检查是否已平方
            if (!squareState.usedSquare[last]) {
                squareElements.input.value = v.replace(/(\d+|A|J|Q|K)(?![\d²])(?=[^\d²]*$)/, m => m+'²');
                squareState.usedSquare[last] = true;
                // 按钮高亮
                squareElements.cardButtons.forEach(btn => {
                    if (btn.textContent === last) btn.classList.add('used-square');
                });
            }
        }
    }
    squareCheckExpressionCompleteness();
}

function squareHandleBackspace() {
    let v = squareElements.input.value;
    if (v.endsWith('²')) {
        // 删除平方标记
        squareElements.input.value = v.slice(0, -1);
        // 取消usedSquare
        const match = v.match(/(\d+|A|J|Q|K)(?=²$)/);
        if (match) {
            squareState.usedSquare[match[0]] = false;
            squareElements.cardButtons.forEach(btn => {
                if (btn.textContent === match[0]) btn.classList.remove('used-square');
            });
        }
    } else {
        squareElements.input.value = v.slice(0, -1);
    }
}

// 检查表达式完整性并自动提交
function squareCheckExpressionCompleteness() {
    if (!squareState.mode) return;
    const userInput = squareElements.input.value.trim();
    if (!userInput) return;
    // 检查是否用到所有4张牌
    let used = [];
    let checkExp = userInput.replace(/(\d+|A|J|Q|K)²/g, '$1');
    for (const card of squareState.randomCards) {
        const cardValue = card.value;
        const reg = new RegExp('\\b' + cardValue + '\\b');
        if (checkExp.match(reg)) {
            used.push(cardValue);
            checkExp = checkExp.replace(reg, 'x');
        }
    }
    if (used.length === 4 && squareIsValidExpression(userInput)) {
        checkSquareUserSolution();
    }
}

function squareIsValidExpression(exp) {
    // 检查括号匹配、非法字符等，可复用原有逻辑，允许²和中括号[]
    try {
        let replaced = exp.replace(/(\d+|A|J|Q|K)²/g, 'Math.pow($1,2)');
        replaced = replaced.replace(/×/g, '*').replace(/÷/g, '/');
        // 替换中括号为小括号以便计算
        replaced = replaced.replace(/\[/g, '(').replace(/\]/g, ')');
        // 替换A/J/Q/K为数字
        replaced = replaced.replace(/A/g, '1').replace(/J/g, '11').replace(/Q/g, '12').replace(/K/g, '13');
        // eslint-disable-next-line no-eval
        eval(replaced);
        return true;
    } catch {
        return false;
    }
}

function checkSquareUserSolution() {
    const userInput = squareElements.input.value.trim();
    let replaced = userInput.replace(/(\d+|A|J|Q|K)²/g, 'Math.pow($1,2)');
    replaced = replaced.replace(/×/g, '*').replace(/÷/g, '/');
    // 替换中括号为小括号以便计算
    replaced = replaced.replace(/\[/g, '(').replace(/\]/g, ')');
    replaced = replaced.replace(/A/g, '1').replace(/J/g, '11').replace(/Q/g, '12').replace(/K/g, '13');
    let result = 0;
    try {
        // eslint-disable-next-line no-eval
        result = eval(replaced);
    } catch {
        result = NaN;
    }
    const resultContainer = squareElements.result;
    resultContainer.classList.remove('success', 'error');
    resultContainer.classList.remove('hidden');
    if (Math.abs(result - 24) < 0.0001) {
        resultContainer.classList.add('success');
        resultContainer.innerHTML = `<div class="flex items-start"><div class="text-success-color text-xl mr-3"><i class="fas fa-check-circle"></i></div><div><h3 class="text-lg font-medium text-gray-800 mb-1">恭喜！</h3><p class="text-gray-600">您的解法 ${userInput} = 24 是正确的！</p></div></div>`;
        squareState.score += 10;
        squareElements.score.textContent = squareState.score;
        if (typeof playSuccessSound === 'function') playSuccessSound();
        if (typeof showCongratulationEffect === 'function') showCongratulationEffect();
        setTimeout(() => { startNewSquareChallenge(); }, 2000);
    } else {
        resultContainer.classList.add('error');
        resultContainer.innerHTML = `<div class="flex items-start"><div class="text-error-color text-xl mr-3"><i class="fas fa-times-circle"></i></div><div><h3 class="text-lg font-medium text-gray-800 mb-1">计算错误</h3><p class="text-gray-600">您的解法 ${userInput} = ${isNaN(result)?'错误':result.toFixed(2)}，不等于24</p></div></div>`;
        if (typeof playErrorSound === 'function') playErrorSound();
    }
}

function showSquareSolution() {
    if (!squareState.solutions.length) {
        squareElements.result.classList.remove('success', 'error');
        squareElements.result.classList.remove('hidden');
        squareElements.result.innerHTML = '<div class="text-gray-600">暂无可用解法</div>';
        return;
    }
    squareElements.result.classList.remove('success', 'error');
    squareElements.result.classList.remove('hidden');

    // 对解法进行分类
    const uniqueSolutions = new Set(); // 用于存储不同类型的解法
    const representativeSolutions = [];

    // 遍历所有解法，根据特征进行分类
    squareState.solutions.forEach(solution => {
        // 提取解法的基本特征
        const hasSquare = solution.includes('²');
        const bracketCount = (solution.match(/[()[\]]/g) || []).length;
        const operatorCount = (solution.match(/[+\-×÷]/g) || []).length;
        
        // 创建解法特征标识
        const solutionType = `${hasSquare ? 'square' : 'normal'}_${operatorCount}ops_${bracketCount}brackets`;
        
        // 如果是新的解法类型，添加到代表性解法中
        if (!uniqueSolutions.has(solutionType) && representativeSolutions.length < 4) {
            uniqueSolutions.add(solutionType);
            representativeSolutions.push({
                solution: solution,
                type: hasSquare ? '平方解法' : '基础解法',
                complexity: bracketCount + operatorCount
            });
        }
    });

    // 生成HTML
    let html = `<div class="text-gray-800 mb-2">经典解法：</div><div class="text-green-700 font-mono space-y-2">`;
    
    // 显示每个代表性解法
    representativeSolutions.forEach((item, index) => {
        html += `<div class="p-2 bg-green-50 rounded">
            <div class="text-sm text-gray-600 mb-1">${item.type}</div>
            <div>${item.solution} = 24</div>
        </div>`;
    });
    
    html += '</div>';

    // 如果还有其他解法，添加展开/收起按钮和容器
    const totalOtherSolutions = squareState.solutions.length - representativeSolutions.length;
    if (totalOtherSolutions > 0) {
        html += `
            <div class="mt-4">
                <button id="toggleSolutions" class="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                    <span class="toggle-text">显示全部${squareState.solutions.length}个解法</span>
                    <i class="fas fa-chevron-down ml-1"></i>
                </button>
                <div id="allSolutions" class="hidden mt-2 p-3 bg-gray-50 rounded max-h-96 overflow-y-auto">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        ${squareState.solutions.map((solution, index) => `
                            <div class="text-sm p-2 border-b border-gray-200 flex items-start">
                                <span class="text-gray-500 mr-2 min-w-[2.5em]">解法${index + 1}:</span>
                                <span class="text-green-700">${solution} = 24</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;

        // 添加展开/收起功能的事件监听
        setTimeout(() => {
            const toggleBtn = document.getElementById('toggleSolutions');
            const allSolutions = document.getElementById('allSolutions');
            const toggleText = toggleBtn.querySelector('.toggle-text');
            const toggleIcon = toggleBtn.querySelector('i');
            
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    const isHidden = allSolutions.classList.contains('hidden');
                    allSolutions.classList.toggle('hidden');
                    toggleIcon.classList.toggle('fa-chevron-down');
                    toggleIcon.classList.toggle('fa-chevron-up');
                    toggleText.textContent = isHidden ? 
                        `收起全部解法` : 
                        `显示全部${squareState.solutions.length}个解法`;
                });
            }
        }, 0);
    }

    squareElements.result.innerHTML = html;
}

// ========== 平方模式解法生成 ==========
function findAllSquareSolutions(numbers) {
    const perms = generatePermutations(numbers);
    const results = [];
    
    for (const perm of perms) {
        // 16种平方组合
        for (let mask=0; mask<16; mask++) {
            const nums = perm.map((n,i)=>((mask>>i)&1)?{v:n,sq:true}:{v:n,sq:false});
            // 只允许每个数字最多平方一次
            const exprs = nums.map(obj => {
                if (obj.sq) {
                    return `${obj.v}²`;
                }
                return obj.v.toString();
            });

            // 生成所有括号和运算符组合
            const ops = ['+','-','*','/'];
            const opCombos = [];
            for (const o1 of ops) for (const o2 of ops) for (const o3 of ops) opCombos.push([o1,o2,o3]);
            
            for (const opSet of opCombos) {
                // 1. 无括号的基本表达式（当运算符优先级足够时）
                const e1 = `${exprs[0]}${opSet[0]}${exprs[1]}${opSet[1]}${exprs[2]}${opSet[2]}${exprs[3]}`;
                
                // 2. 使用小括号改变运算优先级的基本表达式
                const e2 = `(${exprs[0]}${opSet[0]}${exprs[1]})${opSet[1]}${exprs[2]}${opSet[2]}${exprs[3]}`;
                const e3 = `${exprs[0]}${opSet[0]}(${exprs[1]}${opSet[1]}${exprs[2]})${opSet[2]}${exprs[3]}`;
                const e4 = `${exprs[0]}${opSet[0]}${exprs[1]}${opSet[1]}(${exprs[2]}${opSet[2]}${exprs[3]})`;
                
                // 3. 两组运算分别用小括号
                const e5 = `(${exprs[0]}${opSet[0]}${exprs[1]})${opSet[1]}(${exprs[2]}${opSet[2]}${exprs[3]})`;
                
                // 4. 嵌套括号（内层小括号，外层中括号）
                const e6 = `[(${exprs[0]}${opSet[0]}${exprs[1]})${opSet[1]}(${exprs[2]}${opSet[2]}${exprs[3]})]`;
                
                // 评估所有表达式
                [e1,e2,e3,e4,e5,e6].forEach(expr => {
                    let evalExpr = expr.replace(/(\d+)²/g,'Math.pow($1,2)');
                    evalExpr = evalExpr.replace(/\[/g,'(').replace(/\]/g,')');
                    try {
                        if (Math.abs(eval(evalExpr)-24)<0.0001) {
                            results.push(expr.replace(/\*/g,'×').replace(/\//g,'÷'));
                        }
                    } catch{}
                });
            }
        }
    }
    
    // 对结果进行排序和去重，优先选择更简洁的表达式
    return [...new Set(results)].sort((a, b) => {
        // 计算括号数量
        const bracketsA = (a.match(/[()[\]]/g) || []).length;
        const bracketsB = (b.match(/[()[\]]/g) || []).length;
        
        // 优先选择括号少的
        if (bracketsA !== bracketsB) {
            return bracketsA - bracketsB;
        }
        
        // 括号数量相同时，优先选择表达式长度短的
        return a.length - b.length;
    });
}

// ========== 练习模式功能 ==========

// 初始化练习模式
function initPracticeMode() {
    // 隐藏提示区域，默认不显示
    if (practiceElements.hintArea) {
        practiceElements.hintArea.classList.add('hidden');
    }
    
    // 绑定练习模式按钮事件
    if (practiceElements.newChallengeBtn) {
        practiceElements.newChallengeBtn.addEventListener('click', startNewPracticeChallenge);
    }
    
    if (practiceElements.showSolutionBtn) {
        practiceElements.showSolutionBtn.addEventListener('click', showPracticeSolution);
    }
    
    if (practiceElements.showHintBtn) {
        practiceElements.showHintBtn.addEventListener('click', togglePracticeHint);
    }
    
    // 绑定虚拟键盘事件
    document.querySelectorAll('.practice-card-btn').forEach(button => {
        button.addEventListener('click', () => handlePracticeKeyboardInput('card', button.dataset.value));
    });
    
    document.querySelectorAll('.practice-op-btn').forEach(button => {
        button.addEventListener('click', () => handlePracticeKeyboardInput('operator', button.dataset.op));
    });
    
    document.querySelectorAll('.practice-bracket-btn').forEach(button => {
        button.addEventListener('click', () => handlePracticeKeyboardInput('bracket', button.dataset.bracket));
    });
    
    if (practiceElements.backspaceBtn) {
        practiceElements.backspaceBtn.addEventListener('click', handlePracticeBackspace);
    }
    
    if (practiceElements.clearBtn) {
        practiceElements.clearBtn.addEventListener('click', clearPracticeInput);
    }
    
    // 绑定解法选择事件
    document.querySelectorAll('input[name="solution-method"]').forEach(radio => {
        radio.addEventListener('change', function() {
            practiceState.selectedMethod = this.value;
            // 当选择解法时，滚动到当前选中的解法
            scrollToSelectedMethod(this);
            startNewPracticeChallenge();
        });
    });
    
    // 初始化解法列表滚动效果
    initSolutionMethodsScroll();
}

// 初始化解法列表滚动效果
function initSolutionMethodsScroll() {
    const solutionMethods = document.querySelector('.solution-methods');
    if (!solutionMethods) return;
    
    // 确保滚动区域在初始时显示前几项
    solutionMethods.scrollTop = 0;
    
    // 为了更好的用户体验，在鼠标悬停时隐藏渐变效果
    solutionMethods.addEventListener('mouseenter', () => {
        solutionMethods.classList.add('hovering');
    });
    
    solutionMethods.addEventListener('mouseleave', () => {
        solutionMethods.classList.remove('hovering');
    });
}

// 滚动到选中的解法
function scrollToSelectedMethod(radioElement) {
    const solutionMethods = document.querySelector('.solution-methods');
    if (!solutionMethods) return;
    
    const methodItem = radioElement.closest('.solution-method-item');
    if (!methodItem) return;
    
    // 计算需要滚动的位置，确保选中项在视图中央
    const containerHeight = solutionMethods.clientHeight;
    const itemTop = methodItem.offsetTop;
    const itemHeight = methodItem.clientHeight;
    
    // 滚动到选中项，使其位于视图中央
    const scrollTo = itemTop - (containerHeight / 2) + (itemHeight / 2);
    
    // 使用平滑滚动效果
    solutionMethods.scrollTo({
        top: Math.max(0, scrollTo),
        behavior: 'smooth'
    });
}

// 设置练习模式
function setPracticeMode(on) {
    practiceState.mode = on;
    elements.gameModeSelection.classList.add('hidden');
    elements.gameArea.classList.remove('hidden');
    elements.backButton.classList.remove('hidden');
    
    // 隐藏其他游戏区域
    elements.calculationArea.classList.add('hidden');
    elements.challengeArea.classList.add('hidden');
    
    if (typeof squareElements !== 'undefined' && squareElements.area) {
        squareElements.area.classList.add('hidden');
    }
    
    // 显示练习模式区域
    if (on && practiceElements.area) {
        practiceElements.area.classList.remove('hidden');
        startNewPracticeChallenge();
    } else if (practiceElements.area) {
        practiceElements.area.classList.add('hidden');
    }
}

// 开始新的练习
function startNewPracticeChallenge() {
    // 重置状态
    practiceState.hintShown = false;
    
    // 隐藏提示
    if (practiceElements.hintArea) {
        practiceElements.hintArea.classList.add('hidden');
    }
    
    // 生成符合当前所选解法的随机牌
    generateSuitableCards();
    
    // 显示随机牌
    displayPracticeRandomCards();
    
    // 清空输入
    clearPracticeInput();
    
    // 重置计时器
    resetPracticeTimer();
    
    // 重置分数
    practiceState.score = 0;
    if (practiceElements.score) {
        practiceElements.score.textContent = practiceState.score;
    }
    
    // 隐藏结果区域
    if (practiceElements.result) {
        practiceElements.result.classList.add('hidden');
    }
    
    // 更新卡片按钮状态
    updatePracticeCardButtonsDisplay();
    
    // 计算所有可能的解法
    practiceState.solutions = findAllSolutions(practiceState.randomCards.map(card => cardValueToNumber(card.value)));
}

// 生成符合当前所选解法的随机牌
function generateSuitableCards() {
    let attempts = 0;
    const maxAttempts = 100; // 设置最大尝试次数
    let found = false;
    
    while (!found && attempts < maxAttempts) {
        // 生成随机4张牌
        const randomCards = generateRandomCards(4);
        const numbers = randomCards.map(card => cardValueToNumber(card.value));
        
        // 检查是否符合所选解法
        if (practiceState.selectedMethod === 'all') {
            // 确保有解法
            const solutions = findAllSolutions(numbers);
            if (solutions.length > 0) {
                practiceState.randomCards = randomCards;
                found = true;
            }
        } else if (practiceState.selectedMethod === 'difference') {
            // 检查是否符合差值运算法
            if (isSuitableForDifferenceMethod(numbers)) {
                practiceState.randomCards = randomCards;
                found = true;
            }
        } else if (practiceState.selectedMethod === 'elimination-zero') {
            // 检查是否符合消除法一（0特性）
            if (isSuitableForEliminationZeroMethod(numbers)) {
                practiceState.randomCards = randomCards;
                found = true;
            }
        } else if (practiceState.selectedMethod === 'elimination-one') {
            // 检查是否符合消除法二（1特性）
            if (isSuitableForEliminationOneMethod(numbers)) {
                practiceState.randomCards = randomCards;
                found = true;
            }
        } else if (practiceState.selectedMethod === 'fixed-factor') {
            // 检查是否符合固定法
            if (isSuitableForFixedFactorMethod(numbers)) {
                practiceState.randomCards = randomCards;
                found = true;
            }
        } else if (practiceState.selectedMethod === 'group-addition') {
            // 检查是否符合小组凑加法
            if (isSuitableForGroupAdditionMethod(numbers)) {
                practiceState.randomCards = randomCards;
                found = true;
            }
        } else if (practiceState.selectedMethod === 'group-subtraction') {
            // 检查是否符合小组凑减法
            if (isSuitableForGroupSubtractionMethod(numbers)) {
                practiceState.randomCards = randomCards;
                found = true;
            }
        } else if (practiceState.selectedMethod === 'group-multiplication') {
            // 检查是否符合小组凑乘法
            if (isSuitableForGroupMultiplicationMethod(numbers)) {
                practiceState.randomCards = randomCards;
                found = true;
            }
        } else if (practiceState.selectedMethod === 'group-division') {
            // 检查是否符合小组凑除法
            if (isSuitableForGroupDivisionMethod(numbers)) {
                practiceState.randomCards = randomCards;
                found = true;
            }
        } else if (practiceState.selectedMethod === 'double-replacement') {
            // 检查是否符合两倍关系替换法
            if (isSuitableForDoubleReplacementMethod(numbers)) {
                practiceState.randomCards = randomCards;
                found = true;
            }
        } else if (practiceState.selectedMethod === 'division-replacement') {
            // 检查是否符合除法替换法
            if (isSuitableForDivisionReplacementMethod(numbers)) {
                practiceState.randomCards = randomCards;
                found = true;
            }
        } else if (practiceState.selectedMethod === 'three-one-addition-subtraction') {
            // 检查是否符合三一加减法
            if (isSuitableForThreeOneAdditionSubtractionMethod(numbers)) {
                practiceState.randomCards = randomCards;
                found = true;
            }
        } else if (practiceState.selectedMethod === 'three-one-division') {
            // 检查是否符合三一凑除法
            if (isSuitableForThreeOneDivisionMethod(numbers)) {
                practiceState.randomCards = randomCards;
                found = true;
            }
        }
        
        attempts++;
    }
    
    // 如果尝试多次后仍找不到合适的牌，就使用预设的例子
    if (!found) {
        if (practiceState.selectedMethod === 'difference') {
            // 预设一个符合差值运算法的例子
            practiceState.randomCards = [
                { value: '10', suit: '♥', color: 'red' },
                { value: '9', suit: '♠', color: 'black' },
                { value: '8', suit: '♦', color: 'red' },
                { value: '5', suit: '♣', color: 'black' }
            ];
        } else if (practiceState.selectedMethod === 'elimination-zero') {
            // 预设一个符合消除法一的例子（0特性）
            practiceState.randomCards = [
                { value: '8', suit: '♥', color: 'red' },
                { value: '4', suit: '♠', color: 'black' },
                { value: '6', suit: '♦', color: 'red' },
                { value: '6', suit: '♣', color: 'black' }
            ];
            // 8 * 4 = 32, 6 - 6 = 0, 32 + 0 = 32 (可以通过多种方式得到24)
        } else if (practiceState.selectedMethod === 'elimination-one') {
            // 预设一个符合消除法二的例子（1特性）
            practiceState.randomCards = [
                { value: '8', suit: '♥', color: 'red' },
                { value: '3', suit: '♠', color: 'black' },
                { value: '3', suit: '♦', color: 'red' },
                { value: '3', suit: '♣', color: 'black' }
            ];
            // 8 * 3 = 24, 3 / 3 = 1, 24 * 1 = 24
        } else if (practiceState.selectedMethod === 'fixed-factor') {
            // 预设一个符合固定法的例子
            practiceState.randomCards = [
                { value: '6', suit: '♥', color: 'red' },
                { value: '3', suit: '♠', color: 'black' },
                { value: '2', suit: '♦', color: 'red' },
                { value: '4', suit: '♣', color: 'black' }
            ];
            // 6是24的因数，24÷6=4，剩下的2、3、4可以通过计算得到4
        } else if (practiceState.selectedMethod === 'group-addition') {
            // 预设一个符合小组凑加法的例子
            practiceState.randomCards = [
                { value: '10', suit: '♥', color: 'red' },
                { value: '2', suit: '♠', color: 'black' },
                { value: '9', suit: '♦', color: 'red' },
                { value: '3', suit: '♣', color: 'black' }
            ];
            // (10 + 2) + (9 + 3) = 12 + 12 = 24
        } else if (practiceState.selectedMethod === 'group-subtraction') {
            // 预设一个符合小组凑减法的例子
            practiceState.randomCards = [
                { value: '10', suit: '♥', color: 'red' },
                { value: '13', suit: '♠', color: 'black' },
                { value: '3', suit: '♦', color: 'red' },
                { value: '4', suit: '♣', color: 'black' }
            ];
            // (10 + 13) - (3 - 4) = 23 - (-1) = 24 或 (13 * 3) - 10 - 4 = 39 - 14 = 25
        } else if (practiceState.selectedMethod === 'group-multiplication') {
            // 预设一个符合小组凑乘法的例子
            practiceState.randomCards = [
                { value: '2', suit: '♥', color: 'red' },
                { value: '3', suit: '♠', color: 'black' },
                { value: '4', suit: '♦', color: 'red' },
                { value: '6', suit: '♣', color: 'black' }
            ];
            // (2 * 3) * (4 / 6) = 6 * (2/3) = 4, 4 * 6 = 24 或 (2 * 6) * (3 * 4) = 12 * 2 = 24
        } else if (practiceState.selectedMethod === 'group-division') {
            // 预设一个符合小组凑除法的例子
            practiceState.randomCards = [
                { value: '12', suit: '♥', color: 'red' },
                { value: '4', suit: '♠', color: 'black' },
                { value: '2', suit: '♦', color: 'red' },
                { value: '1', suit: '♣', color: 'black' }
            ];
            // (12 * 4) / (2 / 1) = 48 / 2 = 24
        } else if (practiceState.selectedMethod === 'double-replacement') {
            // 预设一个符合两倍关系替换法的例子
            practiceState.randomCards = [
                { value: '12', suit: '♥', color: 'red' },
                { value: '6', suit: '♠', color: 'black' },
                { value: '8', suit: '♦', color: 'red' },
                { value: '4', suit: '♣', color: 'black' }
            ];
            // 12 = 6 * 2，而 6 + 8 + 4 = 18，替换6为(12-6)，得到 (12-6) + 8 + 4 = 18，此时再用适当的运算得到24
        } else if (practiceState.selectedMethod === 'division-replacement') {
            // 预设一个符合除法替换法的例子
            practiceState.randomCards = [
                { value: '4', suit: '♥', color: 'red' },
                { value: '2', suit: '♠', color: 'black' },
                { value: '6', suit: '♦', color: 'red' },
                { value: '8', suit: '♣', color: 'black' }
            ];
            // 将2替换为4÷2，然后 (4÷2) * 6 * 8 = 96，再进行其他运算得到24
        } else if (practiceState.selectedMethod === 'three-one-addition-subtraction') {
            // 预设一个符合三一加减法的例子
            practiceState.randomCards = [
                { value: '3', suit: '♥', color: 'red' },
                { value: '9', suit: '♠', color: 'black' },
                { value: '8', suit: '♦', color: 'red' },
                { value: '10', suit: '♣', color: 'black' }
            ];
            // 固定3，然后 9 + 8 + 10 = 27, 27 - 3 = 24
        } else if (practiceState.selectedMethod === 'three-one-division') {
            // 预设一个符合三一凑除法的例子
            practiceState.randomCards = [
                { value: '3', suit: '♥', color: 'red' },
                { value: '4', suit: '♠', color: 'black' },
                { value: '6', suit: '♦', color: 'red' },
                { value: '12', suit: '♣', color: 'black' }
            ];
            // 选3为除数，需要凑出72：4 * 6 * 3 = 72, 72 ÷ 3 = 24
        } else {
            // 预设一个一般的例子
            practiceState.randomCards = [
                { value: '5', suit: '♥', color: 'red' },
                { value: '5', suit: '♠', color: 'black' },
                { value: '5', suit: '♦', color: 'red' },
                { value: '9', suit: '♣', color: 'black' }
            ];
        }
    }
}

// 检查一组数字是否适合使用差值运算法
function isSuitableForDifferenceMethod(numbers) {
    const sum = numbers.reduce((a, b) => a + b, 0);
    
    // 差值运算法适用于和大于24的情况
    if (sum <= 24) {
        return false;
    }
    
    const diff = sum - 24;
    const halfDiff = diff / 2;
    
    // 检查是否有一个数字恰好等于差值的一半
    // 或者有两个数字之和等于差值
    const hasHalfDiff = numbers.some(num => Math.abs(num - halfDiff) < 0.0001);
    
    // 检查是否有两个数之和等于差值
    let hasDiffSum = false;
    for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
            if (Math.abs(numbers[i] + numbers[j] - diff) < 0.0001) {
                hasDiffSum = true;
                break;
            }
        }
        if (hasDiffSum) break;
    }
    
    // 确保存在24点解法
    const solutions = findAllSolutions(numbers);
    const hasSolutions = solutions.length > 0;
    
    // 返回是否适合差值运算法
    return (hasHalfDiff || hasDiffSum) && hasSolutions;
}

// 检查一组数字是否适合使用消除法一（0特性）
function isSuitableForEliminationZeroMethod(numbers) {
    // 检查是否有两个相同的数
    let hasPair = false;
    let pairIndices = [];
    
    for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
            if (Math.abs(numbers[i] - numbers[j]) < 0.0001) {
                hasPair = true;
                pairIndices = [i, j];
                break;
            }
        }
        if (hasPair) break;
    }
    
    if (!hasPair) return false;
    
    // 检查剩余的两个数是否能组合出24
    const otherIndices = [0, 1, 2, 3].filter(i => !pairIndices.includes(i));
    const a = numbers[otherIndices[0]];
    const b = numbers[otherIndices[1]];
    
    // 检查a和b是否能通过基本运算得到24
    const operations = [
        () => a + b,
        () => a - b,
        () => b - a,
        () => a * b,
        () => a / b,
        () => b / a
    ];
    
    const canMake24 = operations.some(op => {
        try {
            const result = op();
            return Math.abs(result - 24) < 0.0001;
        } catch (e) {
            return false;
        }
    });
    
    // 确保存在24点解法
    const solutions = findAllSolutions(numbers);
    const hasSolutions = solutions.length > 0;
    
    return hasPair && canMake24 && hasSolutions;
}

// 检查一组数字是否适合使用消除法二（1特性）
function isSuitableForEliminationOneMethod(numbers) {
    // 用于检查两个数能否通过基本运算得到特定值
    const canMakeValue = (a, b, target) => {
        const operations = [
            () => a + b,
            () => a - b,
            () => b - a,
            () => a * b,
            () => a !== 0 && b !== 0 ? a / b : null,
            () => a !== 0 && b !== 0 ? b / a : null
        ];
        
        return operations.some(op => {
            try {
                const result = op();
                return result !== null && Math.abs(result - target) < 0.0001;
            } catch (e) {
                return false;
            }
        });
    };
    
    let canMake24And1 = false;
    
    // 检查所有可能的组合
    for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
            // 检查数字对(i,j)是否能凑出24
            const pair1 = [numbers[i], numbers[j]];
            const canMake24 = canMakeValue(pair1[0], pair1[1], 24);
            
            if (canMake24) {
                // 检查剩余的两个数是否能凑出1
                const remainingIndices = [0, 1, 2, 3].filter(idx => idx !== i && idx !== j);
                const pair2 = [numbers[remainingIndices[0]], numbers[remainingIndices[1]]];
                const canMake1 = canMakeValue(pair2[0], pair2[1], 1);
                
                if (canMake1) {
                    canMake24And1 = true;
                    break;
                }
            }
        }
        if (canMake24And1) break;
    }
    
    // 确保存在24点解法
    const solutions = findAllSolutions(numbers);
    const hasSolutions = solutions.length > 0;
    
    return canMake24And1 && hasSolutions;
}

// 检查一组数字是否适合使用固定法
function isSuitableForFixedFactorMethod(numbers) {
    // 检查数字中是否有24的因数
    const factors = getFactorsOf24();
    const hasFactor = numbers.some(num => factors.includes(num));
    
    if (!hasFactor) return false;
    
    // 对于每个24的因数，检查剩余的数是否能凑出与之相乘等于24的数
    let canSolveWithFixedFactor = false;
    
    for (let i = 0; i < numbers.length; i++) {
        // 如果当前数字是24的因数
        if (factors.includes(numbers[i])) {
            const factor = numbers[i];
            const targetValue = 24 / factor; // 需要凑出的值
            
            // 剩余的三个数字
            const remainingNumbers = numbers.filter((_, idx) => idx !== i);
            
            // 检查剩余三个数是否能凑出targetValue
            if (canMakeTargetValue(remainingNumbers, targetValue)) {
                canSolveWithFixedFactor = true;
                break;
            }
        }
    }
    
    // 确保存在24点解法
    const solutions = findAllSolutions(numbers);
    const hasSolutions = solutions.length > 0;
    
    return canSolveWithFixedFactor && hasSolutions;
}

// 获取24的所有因数
function getFactorsOf24() {
    return [1, 2, 3, 4, 6, 8, 12, 24];
}

// 检查一组数字是否能凑出目标值
function canMakeTargetValue(numbers, target) {
    // 如果只有一个数字，检查它是否等于目标值
    if (numbers.length === 1) {
        return Math.abs(numbers[0] - target) < 0.0001;
    }
    
    // 如果有多个数字，尝试各种组合方式
    for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
            const a = numbers[i];
            const b = numbers[j];
            const restNumbers = numbers.filter((_, idx) => idx !== i && idx !== j);
            
            // 尝试不同的运算符
            const operations = [
                a + b,
                a - b,
                b - a,
                a * b,
                a !== 0 ? b / a : null,
                b !== 0 ? a / b : null
            ];
            
            for (const result of operations) {
                if (result === null) continue;
                
                // 如果剩余数字为空，检查当前结果是否等于目标值
                if (restNumbers.length === 0) {
                    if (Math.abs(result - target) < 0.0001) {
                        return true;
                    }
                } else {
                    // 递归检查剩余数字
                    if (canMakeTargetValue([...restNumbers, result], target)) {
                        return true;
                    }
                }
            }
        }
    }
    
    return false;
}

// 显示练习模式随机牌
function displayPracticeRandomCards() {
    if (!practiceElements.randomCardsContainer) return;
    
    practiceElements.randomCardsContainer.innerHTML = '';
    
    practiceState.randomCards.forEach((card, index) => {
        const cardElement = createCardElement(card.value, card.suit, card.color);
        cardElement.classList.add('large-card');
        cardElement.dataset.index = index;
        
        // 添加ABCD标记
        const indexMarker = document.createElement('div');
        indexMarker.className = 'absolute top-0 left-0 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold';
        indexMarker.textContent = String.fromCharCode(65 + index); // A, B, C, D
        cardElement.appendChild(indexMarker);
        
        practiceElements.randomCardsContainer.appendChild(cardElement);
    });
}

// 更新练习模式卡片按钮状态
function updatePracticeCardButtonsDisplay() {
    document.querySelectorAll('.practice-card-btn').forEach((btn, index) => {
        if (index < practiceState.randomCards.length) {
            btn.disabled = false;
            // 将按钮的文本内容设置为实际的牌值
            btn.textContent = practiceState.randomCards[index].value;
            // data-value 仍然保持为 A, B, C, D 用于内部逻辑
            // btn.dataset.value = String.fromCharCode(65 + index); // 这行不需要改变，因为HTML中已经设置好了
        } else {
            btn.disabled = true;
            btn.textContent = String.fromCharCode(65 + index); // 或者设置为空，或保持A,B,C,D作为占位符
        }
    });
}

// 重置练习模式计时器
function resetPracticeTimer() {
    if (practiceState.timerInterval) {
        clearInterval(practiceState.timerInterval);
    }
    
    practiceState.startTime = Date.now();
    
    if (practiceElements.timer) {
        practiceElements.timer.textContent = '00:00';
    }
    
    practiceState.timerInterval = setInterval(updatePracticeTimer, 1000);
}

// 更新练习模式计时器
function updatePracticeTimer() {
    const elapsedSeconds = Math.floor((Date.now() - practiceState.startTime) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    
    if (practiceElements.timer) {
        practiceElements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// 清空练习模式输入
function clearPracticeInput() {
    if (practiceElements.input) {
        practiceElements.input.value = '';
    }
    
    // 重置卡片按钮状态
    document.querySelectorAll('.practice-card-btn').forEach(btn => {
        btn.disabled = false;
    });
}

// 处理练习模式虚拟键盘输入
function handlePracticeKeyboardInput(type, value) {
    if (!practiceElements.input) return;
    
    const input = practiceElements.input;
    
    if (type === 'card') {
        // 将A, B, C, D转换为对应索引的卡片值
        const cardIndex = value.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        if (cardIndex >= 0 && cardIndex < practiceState.randomCards.length) {
            const card = practiceState.randomCards[cardIndex];
            input.value += card.value;
            
            // 禁用该卡片按钮
            document.querySelector(`.practice-card-btn[data-value="${value}"]`).disabled = true;
        }
    } else if (type === 'operator') {
        input.value += value;
    } else if (type === 'bracket') {
        input.value += value;
    }
    
    // 检查表达式是否完整
    practiceCheckExpressionCompleteness();
}

// 处理练习模式退格
function handlePracticeBackspace() {
    if (!practiceElements.input) return;
    
    const input = practiceElements.input;
    
    if (input.value.length > 0) {
        // 检查最后一个字符是否为数字
        const lastChar = input.value.slice(-1);
        
        // 如果是多位数，需要找到整个数字
        if (/\d/.test(lastChar)) {
            let i = input.value.length - 1;
            while (i >= 0 && /\d/.test(input.value[i])) {
                i--;
            }
            
            const removedNumber = input.value.slice(i + 1);
            
            // 检查这个数字是否对应一个卡片值
            practiceState.randomCards.forEach((card, index) => {
                if (card.value === removedNumber) {
                    const cardBtn = document.querySelector(`.practice-card-btn[data-value="${String.fromCharCode(65 + index)}"]`);
                    if (cardBtn) {
                        cardBtn.disabled = false;
                    }
                }
            });
            
            input.value = input.value.slice(0, i + 1);
        } else {
            input.value = input.value.slice(0, -1);
        }
    }
}

// 检查练习模式表达式是否完整
function practiceCheckExpressionCompleteness() {
    if (!practiceElements.input) return;
    
    const expression = practiceElements.input.value;
    
    // 检查是否使用了所有四张牌
    const allCardsUsed = practiceState.randomCards.every((card, index) => {
        const cardBtn = document.querySelector(`.practice-card-btn[data-value="${String.fromCharCode(65 + index)}"]`);
        return cardBtn && cardBtn.disabled;
    });
    
    if (allCardsUsed && isValidExpression(expression)) {
        // 自动提交
        checkPracticeUserSolution();
    }
}

// 检查练习模式用户解法
function checkPracticeUserSolution() {
    if (!practiceElements.input || !practiceElements.result) return;
    
    const expression = practiceElements.input.value;
    
    try {
        // 替换乘除符号为JavaScript可识别的符号
        const jsExpression = expression.replace(/×/g, '*').replace(/÷/g, '/');
        const result = eval(jsExpression);
        
        // 检查结果是否等于24
        if (Math.abs(result - 24) < 0.0001) {
            // 计算得分：基础分100 - 用时（秒）* 2，最低得10分
            const elapsedSeconds = Math.floor((Date.now() - practiceState.startTime) / 1000);
            const score = Math.max(10, 100 - elapsedSeconds * 2);
            practiceState.score += score;
            
            if (practiceElements.score) {
                practiceElements.score.textContent = practiceState.score;
            }
            
            // 显示成功信息
            practiceElements.result.innerHTML = `
                <div class="bg-green-100 text-green-800 p-4 rounded-lg">
                    <h3 class="font-bold text-lg mb-2"><i class="fas fa-check-circle mr-2"></i> 恭喜！</h3>
                    <p>您的解法 <span class="font-mono bg-green-50 px-2 py-1 rounded">${expression} = 24</span> 是正确的！</p>
                    <p class="mt-2">您获得了 <span class="font-bold">${score}</span> 分！</p>
                    <p class="mt-2 text-sm">用时：${Math.floor(elapsedSeconds / 60)}分${elapsedSeconds % 60}秒</p>
                </div>
            `;
            
            // 播放成功音效（如果存在）
            if (typeof playSoundEffect === 'function') {
                playSoundEffect('success');
            }
            
        } else {
            // 显示错误信息
            practiceElements.result.innerHTML = `
                <div class="bg-red-100 text-red-800 p-4 rounded-lg">
                    <h3 class="font-bold text-lg mb-2"><i class="fas fa-times-circle mr-2"></i> 很遗憾</h3>
                    <p>您的解法 <span class="font-mono bg-red-50 px-2 py-1 rounded">${expression} = ${result.toFixed(2)}</span> 不等于24。</p>
                    <p class="mt-2">请再试一次！</p>
                </div>
            `;
            
            // 播放失败音效（如果存在）
            if (typeof playSoundEffect === 'function') {
                playSoundEffect('fail');
            }
        }
        
        practiceElements.result.classList.remove('hidden');
        
    } catch (error) {
        // 表达式错误
        practiceElements.result.innerHTML = `
            <div class="bg-orange-100 text-orange-800 p-4 rounded-lg">
                <h3 class="font-bold text-lg mb-2"><i class="fas fa-exclamation-circle mr-2"></i> 表达式错误</h3>
                <p>您的解法 <span class="font-mono bg-orange-50 px-2 py-1 rounded">${expression}</span> 存在语法错误。</p>
                <p class="mt-2">请检查并修正您的表达式。</p>
            </div>
        `;
        practiceElements.result.classList.remove('hidden');
    }
}

// 显示练习模式解法
function showPracticeSolution() {
    if (!practiceElements.result) return;
    
    if (practiceState.solutions.length > 0) {
        // 整理解法
        const solutionsHTML = practiceState.solutions.slice(0, 5).map(solution => {
            return `<li class="font-mono bg-yellow-50 px-2 py-1 rounded mb-1">${solution}</li>`;
        }).join('');
        
        practiceElements.result.innerHTML = `
            <div class="bg-blue-100 text-blue-800 p-4 rounded-lg">
                <h3 class="font-bold text-lg mb-2"><i class="fas fa-lightbulb mr-2"></i> 可能的解法</h3>
                <p>以下是部分可能的解法（最多显示5个）：</p>
                <ul class="mt-2 list-none">
                    ${solutionsHTML}
                </ul>
                ${practiceState.solutions.length > 5 ? `<p class="mt-2 text-sm">还有 ${practiceState.solutions.length - 5} 种解法未显示</p>` : ''}
            </div>
        `;
        
        practiceElements.result.classList.remove('hidden');
    } else {
        practiceElements.result.innerHTML = `
            <div class="bg-gray-100 text-gray-800 p-4 rounded-lg">
                <h3 class="font-bold text-lg mb-2"><i class="fas fa-info-circle mr-2"></i> 没有找到解法</h3>
                <p>这组牌似乎没有有效的24点解法。</p>
                <p class="mt-2">请尝试新的一组牌。</p>
            </div>
        `;
        
        practiceElements.result.classList.remove('hidden');
    }
}

// 切换显示练习模式提示
function togglePracticeHint() {
    if (!practiceElements.hintArea) return;
    
    // 隐藏所有提示区域
    document.querySelectorAll('.practice-hint').forEach(hint => {
        hint.classList.add('hidden');
    });
    
    // 获取当前牌组
    // 在函数作用域内获取一次，避免重复声明
    const currentNumbers = practiceState.randomCards.map(card => cardValueToNumber(card.value));
    
    // 根据当前选择的解法方法显示对应的提示区域并更新内容
    if (practiceState.selectedMethod === 'three-one-addition-subtraction') {
        const hint = document.getElementById('three-one-addition-subtraction-hint');
        
        // 生成针对当前牌组的三一加减法提示
        let hintContent = `
            <h3 class="text-lg font-medium text-yellow-800 mb-2">
                <i class="fas fa-lightbulb mr-2"></i> 三一加减法提示
            </h3>
            <p class="text-sm text-gray-700">对于牌组 [${currentNumbers.join(', ')}]，可以尝试以下思路：</p>
        `;
        
        // 为每个数分析三一加减法的可行性
        let solutionFound = false;
        for (let i = 0; i < currentNumbers.length; i++) {
            const fixedNumber = currentNumbers[i];
            const restNumbers = [...currentNumbers];
            restNumbers.splice(i, 1);
            
            // 需要凑出的目标值
            const targetAdd = 24 - fixedNumber; // 加法情况
            const targetSub = 24 + fixedNumber; // 减法情况
            
            // 检查剩余三个数能否凑出目标值
            if (canMakeTargetValue(restNumbers, targetAdd)) {
                hintContent += `
                    <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                        <p class="text-sm text-gray-700"><strong>固定数字 ${fixedNumber}</strong>，需要用剩余三个数 [${restNumbers.join(', ')}] 凑出 <strong>${targetAdd}</strong>，然后计算 ${targetAdd} + ${fixedNumber} = 24</p>
                    </div>
                `;
                solutionFound = true;
                break;
            } 
            
            if (canMakeTargetValue(restNumbers, targetSub)) {
                hintContent += `
                    <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                        <p class="text-sm text-gray-700"><strong>固定数字 ${fixedNumber}</strong>，需要用剩余三个数 [${restNumbers.join(', ')}] 凑出 <strong>${targetSub}</strong>，然后计算 ${targetSub} - ${fixedNumber} = 24</p>
                    </div>
                `;
                solutionFound = true;
                break;
            }
        }
        
        if (!solutionFound) {
            hintContent += `
                <div class="mt-2">
                    <p class="text-sm text-gray-700">对于这组牌，使用三一加减法较为复杂。请尝试不同的固定数字，看哪一个能让剩余三个数更容易凑出所需结果。</p>
                </div>
            `;
        }
        
        hint.innerHTML = hintContent;
        hint.classList.remove('hidden');
        return;
    } else if (practiceState.selectedMethod === 'three-one-division') {
        const hint = document.getElementById('three-one-division-hint');
        
        // 生成针对当前牌组的三一凑除法提示
        let hintContent = `
            <h3 class="text-lg font-medium text-yellow-800 mb-2">
                <i class="fas fa-lightbulb mr-2"></i> 三一凑除法提示
            </h3>
            <p class="text-sm text-gray-700">对于牌组 [${currentNumbers.join(', ')}]，可以尝试以下思路：</p>
        `;
        
        // 为每个数分析三一凑除法的可行性
        let solutionFound = false;
        for (let i = 0; i < currentNumbers.length; i++) {
            const divisor = currentNumbers[i];
            
            // 除数不能为0
            if (divisor === 0) continue;
            
            const restNumbers = [...currentNumbers];
            restNumbers.splice(i, 1);
            const targetProduct = 24 * divisor; // 需要三个数凑出的积
            
            if (canMakeTargetValue(restNumbers, targetProduct)) {
                hintContent += `
                    <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                        <p class="text-sm text-gray-700"><strong>选择 ${divisor} 作为除数</strong>，需要用剩余三个数 [${restNumbers.join(', ')}] 凑出 <strong>${targetProduct}</strong>，然后计算 ${targetProduct} ÷ ${divisor} = 24</p>
                    </div>
                `;
                solutionFound = true;
                break;
            }
        }
        
        if (!solutionFound) {
            hintContent += `
                <div class="mt-2">
                    <p class="text-sm text-gray-700">对于这组牌，使用三一凑除法较为复杂。可以尝试不同的数作为除数，计算目标积，看剩余三个数能否通过运算得到这个积。</p>
                </div>
            `;
        }
        
        hint.innerHTML = hintContent;
        hint.classList.remove('hidden');
        return;
    } else if (practiceState.selectedMethod === 'difference') {
        const hintDiv = document.getElementById('difference-hint');
        const pTag = hintDiv.querySelector('p');

        if (pTag) {
            let paragraphHTML = '';
            const sum = currentNumbers.reduce((a, b) => a + b, 0);
        const diff = sum - 24;

            paragraphHTML += `当前牌组 [${currentNumbers.join(', ')}]，四个数的和是 ${sum}。<br>`;
        
        if (sum === 24) {
                paragraphHTML += `和正好是24，太棒了！尝试直接相加，例如： (${currentNumbers.join(' + ')}) = 24。`;
        } else if (sum > 24) {
                paragraphHTML += `和比24大 ${diff} (即 ${sum} - 24 = ${diff})。<br>`;
            const halfDiff = diff / 2;
                const matchingIndex = currentNumbers.findIndex(num => Math.abs(num - halfDiff) < 0.0001);
            
            if (matchingIndex !== -1) {
                    const matchedNum = currentNumbers[matchingIndex];
                    const otherNumbers = currentNumbers.filter((num, index) => index !== matchingIndex);
                    paragraphHTML += `注意到数字 ${matchedNum} 正好是差值 ${diff} 的一半。根据差值运算法，可以尝试用其他三个数 (${otherNumbers.join(', ')}) 的和减去 ${matchedNum}。<br>`;
                    paragraphHTML += `即： (${otherNumbers.join(' + ')}) - ${matchedNum} = ${(otherNumbers.reduce((a,b)=>a+b,0))} - ${matchedNum} = ${otherNumbers.reduce((a,b)=>a+b,0) - matchedNum}。`;
                    if (Math.abs(otherNumbers.reduce((a,b)=>a+b,0) - matchedNum - 24) < 0.0001) {
                        paragraphHTML += ` (等于24！🎉)`;
            } else {
                        paragraphHTML += ` (不等于24，差值法提示思路，具体运算需验证)。`;
                    }
                } else {
                    let foundPairEqualsDiff = false;
                    for (let i = 0; i < currentNumbers.length; i++) {
                        for (let j = i + 1; j < currentNumbers.length; j++) {
                            if (Math.abs(currentNumbers[i] + currentNumbers[j] - diff) < 0.0001) {
                                const pairSum = currentNumbers[i] + currentNumbers[j];
                                const remaining = currentNumbers.filter((n, idx) => idx !== i && idx !== j);
                                paragraphHTML += `注意到 ${currentNumbers[i]} + ${currentNumbers[j]} = ${pairSum}，这个和等于差值 ${diff}。<br>可以尝试将剩余的数 (${remaining.join(', ')}) 相加/减，并与这对数的和进行运算。或者，更直接地，用四个数的总和 ${sum} 减去这两个数的和 ${pairSum} (因为它们是差值)，再减一次这两个数的和：${sum} - ${pairSum} - ${pairSum}。但这不直接是差值运算法。`;
                                foundPairEqualsDiff = true;
                                break;
                            }
                        }
                        if (foundPairEqualsDiff) break;
                    }
                    if (!foundPairEqualsDiff) {
                        paragraphHTML += `没有找到直接等于差值一半的数。尝试寻找牌组中是否有数字组合可以凑出 ${diff}，然后将这部分从总和中"减掉两次"效应，或者用其他三个数的和减去一个等于差值一半的数。`;
                    }
                }
                 paragraphHTML += `<br><br>差值运算法的核心思想是：如果四个数的和 (S) 大于24，计算差值 D = S - 24。如果有一个数 X 恰好等于 D/2，则可以用其余三个数的和减去 X 得到24。`;

            } else { // sum < 24
            const deficit = 24 - sum;
                paragraphHTML += `和比24小 ${deficit} (即 24 - ${sum} = ${deficit})。<br>差值运算法主要适用于和大于24的情况。这种情况下，您需要通过乘法或除法来显著增大某些数字或中间结果。`;
        }
            pTag.innerHTML = paragraphHTML;
        }
        hintDiv.classList.remove('hidden');
        return;
    } else if (practiceState.selectedMethod === 'elimination-zero') {
        const hint = document.getElementById('elimination-zero-hint');
        
        // 生成针对当前牌组的消除法一（0特性）提示
        let hintContent = `
            <h3 class="text-lg font-medium text-yellow-800 mb-2">
                <i class="fas fa-lightbulb mr-2"></i> 消除法一（0特性）提示
            </h3>
            <p class="text-sm text-gray-700">对于牌组 [${currentNumbers.join(', ')}]，可以尝试以下思路：</p>
        `;
        
        // 寻找相同的两个数
        let pairValue = null;
        let pairIndices = [];
        
        for (let i = 0; i < currentNumbers.length; i++) {
            for (let j = i + 1; j < currentNumbers.length; j++) {
                if (Math.abs(currentNumbers[i] - currentNumbers[j]) < 0.0001) {
                    pairValue = currentNumbers[i];
                    pairIndices = [i, j];
                    break;
                }
            }
            if (pairValue !== null) break;
        }
        
        if (pairValue !== null) {
            // 找到相同的两个数
            const otherIndices = [0, 1, 2, 3].filter(i => !pairIndices.includes(i));
            const a = currentNumbers[otherIndices[0]];
            const b = currentNumbers[otherIndices[1]];
            
            hintContent += `
                <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                    <p class="text-sm text-gray-700"><strong>找到两个相同的数：${pairValue}</strong></p>
                    <p class="text-sm text-gray-700">可以利用 ${pairValue} - ${pairValue} = 0</p>
                    <p class="text-sm text-gray-700">现在需要用剩下的两个数 ${a} 和 ${b} 凑出24</p>
                </div>
            `;
            
            // 尝试找出a和b能通过哪种运算得到24
            if (Math.abs(a + b - 24) < 0.0001) {
                hintContent += `
                    <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                        <p class="text-sm text-gray-700">可以尝试: ${a} + ${b} + (${pairValue} - ${pairValue}) = ${a + b} + 0 = 24</p>
                    </div>
                `;
            } else if (Math.abs(a - b - 24) < 0.0001) {
                hintContent += `
                    <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                        <p class="text-sm text-gray-700">可以尝试: ${a} - ${b} + (${pairValue} - ${pairValue}) = ${a - b} + 0 = 24</p>
                    </div>
                `;
            } else if (Math.abs(b - a - 24) < 0.0001) {
                hintContent += `
                    <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                        <p class="text-sm text-gray-700">可以尝试: ${b} - ${a} + (${pairValue} - ${pairValue}) = ${b - a} + 0 = 24</p>
                    </div>
                `;
            } else if (Math.abs(a * b - 24) < 0.0001) {
                hintContent += `
                    <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                        <p class="text-sm text-gray-700">可以尝试: ${a} × ${b} + (${pairValue} - ${pairValue}) = ${a * b} + 0 = 24</p>
                    </div>
                `;
            } else if (b !== 0 && Math.abs(a / b - 24) < 0.0001) {
                hintContent += `
                    <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                        <p class="text-sm text-gray-700">可以尝试: ${a} ÷ ${b} + (${pairValue} - ${pairValue}) = ${a / b} + 0 = 24</p>
                    </div>
                `;
            } else if (a !== 0 && Math.abs(b / a - 24) < 0.0001) {
                hintContent += `
                    <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                        <p class="text-sm text-gray-700">可以尝试: ${b} ÷ ${a} + (${pairValue} - ${pairValue}) = ${b / a} + 0 = 24</p>
                    </div>
                `;
            } else {
                hintContent += `
                    <div class="mt-2">
                        <p class="text-sm text-gray-700">找到了两个相同的数 ${pairValue}，但剩余的两个数 ${a} 和 ${b} 难以直接凑出24，需要尝试更复杂的组合。</p>
                    </div>
                `;
            }
        } else {
            hintContent += `
                <div class="mt-2">
                    <p class="text-sm text-gray-700">这组牌中没有两个完全相同的数，不适合直接使用消除法一。可以尝试其他解法。</p>
                </div>
            `;
        }
        
        hint.innerHTML = hintContent;
        hint.classList.remove('hidden');
        return;
    } else if (practiceState.selectedMethod === 'elimination-one') {
        const hint = document.getElementById('elimination-one-hint');
        
        // 生成针对当前牌组的消除法二（1特性）提示
        let hintContent = `
            <h3 class="text-lg font-medium text-yellow-800 mb-2">
                <i class="fas fa-lightbulb mr-2"></i> 消除法二（1特性）提示
            </h3>
            <p class="text-sm text-gray-700">对于牌组 [${currentNumbers.join(', ')}]，可以尝试以下思路：</p>
        `;
        
        // 寻找能凑出24和1的两对数
        let pair24 = null;
        let pair1 = null;
        let op24 = null;
        let op1 = null;
        
        // 检查所有可能的数字对
        for (let i = 0; i < currentNumbers.length; i++) {
            for (let j = i + 1; j < currentNumbers.length; j++) {
                const a = currentNumbers[i];
                const b = currentNumbers[j];
                
                // 检查是否能凑出24
                if (Math.abs(a + b - 24) < 0.0001) {
                    pair24 = [a, b];
                    op24 = '+';
                } else if (Math.abs(a - b - 24) < 0.0001) {
                    pair24 = [a, b];
                    op24 = '-';
                } else if (Math.abs(b - a - 24) < 0.0001) {
                    pair24 = [b, a];
                    op24 = '-';
                } else if (Math.abs(a * b - 24) < 0.0001) {
                    pair24 = [a, b];
                    op24 = '*';
                } else if (a !== 0 && Math.abs(b / a - 24) < 0.0001) {
                    pair24 = [b, a];
                    op24 = '/';
                } else if (b !== 0 && Math.abs(a / b - 24) < 0.0001) {
                    pair24 = [a, b];
                    op24 = '/';
                }
                
                // 检查是否能凑出1
                if (Math.abs(a + b - 1) < 0.0001) {
                    pair1 = [a, b];
                    op1 = '+';
                } else if (Math.abs(a - b - 1) < 0.0001) {
                    pair1 = [a, b];
                    op1 = '-';
                } else if (Math.abs(b - a - 1) < 0.0001) {
                    pair1 = [b, a];
                    op1 = '-';
                } else if (Math.abs(a * b - 1) < 0.0001) {
                    pair1 = [a, b];
                    op1 = '*';
                } else if (a !== 0 && Math.abs(b / a - 1) < 0.0001) {
                    pair1 = [b, a];
                    op1 = '/';
                } else if (b !== 0 && Math.abs(a / b - 1) < 0.0001) {
                    pair1 = [a, b];
                    op1 = '/';
                }
            }
        }
        
        if (pair24 !== null && pair1 !== null) {
            // 验证两对数没有重复
            const pair24Indices = [];
            const pair1Indices = [];
            for (let i = 0; i < currentNumbers.length; i++) {
                if (pair24.includes(currentNumbers[i]) && pair24Indices.length < 2) {
                    pair24Indices.push(i);
                }
                if (pair1.includes(currentNumbers[i]) && pair1Indices.length < 2) {
                    pair1Indices.push(i);
                }
            }
            
            // 检查是否有重复
            const hasOverlap = pair24Indices.some(i => pair1Indices.includes(i));
            
            if (!hasOverlap) {
                let opSymbol24, opSymbol1;
                switch (op24) {
                    case '+': opSymbol24 = '+'; break;
                    case '-': opSymbol24 = '-'; break;
                    case '*': opSymbol24 = '×'; break;
                    case '/': opSymbol24 = '÷'; break;
                }
                
                switch (op1) {
                    case '+': opSymbol1 = '+'; break;
                    case '-': opSymbol1 = '-'; break;
                    case '*': opSymbol1 = '×'; break;
                    case '/': opSymbol1 = '÷'; break;
                }
                
                hintContent += `
                    <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                        <p class="text-sm text-gray-700"><strong>找到两对数组合：</strong></p>
                        <p class="text-sm text-gray-700">1) ${pair24[0]} ${opSymbol24} ${pair24[1]} = 24</p>
                        <p class="text-sm text-gray-700">2) ${pair1[0]} ${opSymbol1} ${pair1[1]} = 1</p>
                        <p class="text-sm text-gray-700">利用1的特性：24 × 1 = 24，可以尝试：(${pair24[0]} ${opSymbol24} ${pair24[1]}) × (${pair1[0]} ${opSymbol1} ${pair1[1]}) = 24 × 1 = 24</p>
                    </div>
                `;
        } else {
                hintContent += `
                    <div class="mt-2">
                        <p class="text-sm text-gray-700">找到了可能的组合，但这些组合使用了重复的数字，不符合每个数字只能使用一次的规则。</p>
                    </div>
                `;
            }
        } else {
            hintContent += `
                <div class="mt-2">
                    <p class="text-sm text-gray-700">在这组牌中，难以找到一对数凑出24，同时另一对数凑出1的组合。可以尝试其他解法。</p>
                </div>
            `;
        }
        
        hint.innerHTML = hintContent;
        hint.classList.remove('hidden');
        return;
    } else if (practiceState.selectedMethod === 'fixed-factor') {
        const hint = document.getElementById('fixed-factor-hint');
        
        // 生成针对当前牌组的固定法提示
        let hintContent = `
            <h3 class="text-lg font-medium text-yellow-800 mb-2">
                <i class="fas fa-lightbulb mr-2"></i> 固定法提示
            </h3>
            <p class="text-sm text-gray-700">对于牌组 [${currentNumbers.join(', ')}]，可以尝试以下思路：</p>
        `;
        
        // 寻找24的因数
        const factors = getFactorsOf24();
        const factorsFound = [];
        
        // 检查当前牌组中是否有24的因数
        for (const num of currentNumbers) {
            if (factors.includes(num)) {
                factorsFound.push(num);
            }
        }
        
        if (factorsFound.length > 0) {
            hintContent += `
                <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                    <p class="text-sm text-gray-700"><strong>找到24的因数：${factorsFound.join(', ')}</strong></p>
                </div>
            `;
            
            // 对每个找到的因数进行分析
            for (const factor of factorsFound) {
                const otherFactor = 24 / factor;
                const restNumbers = [...currentNumbers];
                const factorIndex = restNumbers.indexOf(factor);
                if (factorIndex !== -1) {
                    restNumbers.splice(factorIndex, 1);
                }
                
                hintContent += `
                    <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                        <p class="text-sm text-gray-700">固定 ${factor} 作为一个因数，需要凑出另一个因数 ${otherFactor}，使得 ${factor} × ${otherFactor} = 24</p>
                    </div>
                `;
                
                // 检查剩余三个数能否凑出需要的另一个因数
                if (canMakeTargetValue(restNumbers, otherFactor)) {
                    hintContent += `
                        <div class="mt-2 ml-4">
                            <p class="text-sm text-gray-700">剩余的数 [${restNumbers.join(', ')}] 可以凑出 ${otherFactor}，然后计算 ${factor} × ${otherFactor} = 24</p>
                        </div>
                    `;
                    break;
                }
            }
        } else {
            hintContent += `
                <div class="mt-2">
                    <p class="text-sm text-gray-700">这组牌中没有24的因数（1, 2, 3, 4, 6, 8, 12），不适合直接使用固定法。可以尝试其他解法。</p>
                </div>
            `;
        }
        
        hint.innerHTML = hintContent;
        hint.classList.remove('hidden');
        return;
    } else if (practiceState.selectedMethod === 'group-addition') {
        const hint = document.getElementById('group-addition-hint');
        
        // 生成针对当前牌组的小组凑加法提示
        let hintContent = `
            <h3 class="text-lg font-medium text-yellow-800 mb-2">
                <i class="fas fa-lightbulb mr-2"></i> 小组凑加法提示
            </h3>
            <p class="text-sm text-gray-700">对于牌组 [${currentNumbers.join(', ')}]，可以尝试以下思路：</p>
        `;
        
        // 检查所有可能的分组方式
        const allPairs = [
            // (0,1), (2,3)
            {
                pair1: [currentNumbers[0], currentNumbers[1]],
                pair2: [currentNumbers[2], currentNumbers[3]]
            },
            // (0,2), (1,3)
            {
                pair1: [currentNumbers[0], currentNumbers[2]],
                pair2: [currentNumbers[1], currentNumbers[3]]
            },
            // (0,3), (1,2)
            {
                pair1: [currentNumbers[0], currentNumbers[3]],
                pair2: [currentNumbers[1], currentNumbers[2]]
            }
        ];
        
        let solutionFound = false;
        
        for (const group of allPairs) {
            // 尝试不同的运算符
            const operations = [
                { name: '+', func: (a, b) => a + b, symbol: '+' },
                { name: '-', func: (a, b) => a - b, symbol: '-' },
                { name: '-r', func: (a, b) => b - a, symbol: '-' },
                { name: '*', func: (a, b) => a * b, symbol: '×' },
                { name: '/', func: (a, b) => a !== 0 ? b / a : null, symbol: '÷' },
                { name: '/r', func: (a, b) => b !== 0 ? a / b : null, symbol: '÷' }
            ];
            
            for (const op1 of operations) {
                for (const op2 of operations) {
                    try {
                        const result1 = op1.func(group.pair1[0], group.pair1[1]);
                        const result2 = op2.func(group.pair2[0], group.pair2[1]);
                        
                        if (result1 !== null && result2 !== null && Math.abs(result1 + result2 - 24) < 0.0001) {
                            // 找到符合条件的组合
                            let op1Str, op2Str;
                            
                            if (op1.name === '-r') {
                                op1Str = `${group.pair1[1]} - ${group.pair1[0]}`;
                            } else if (op1.name === '/r') {
                                op1Str = `${group.pair1[1]} ÷ ${group.pair1[0]}`;
                            } else {
                                op1Str = `${group.pair1[0]} ${op1.symbol} ${group.pair1[1]}`;
                            }
                            
                            if (op2.name === '-r') {
                                op2Str = `${group.pair2[1]} - ${group.pair2[0]}`;
                            } else if (op2.name === '/r') {
                                op2Str = `${group.pair2[1]} ÷ ${group.pair2[0]}`;
                            } else {
                                op2Str = `${group.pair2[0]} ${op2.symbol} ${group.pair2[1]}`;
                            }
                            
                            hintContent += `
                                <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                                    <p class="text-sm text-gray-700"><strong>将牌组分成两对：</strong></p>
                                    <p class="text-sm text-gray-700">第一组: (${op1Str}) = ${result1}</p>
                                    <p class="text-sm text-gray-700">第二组: (${op2Str}) = ${result2}</p>
                                    <p class="text-sm text-gray-700">然后: ${result1} + ${result2} = 24</p>
                                </div>
                            `;
                            solutionFound = true;
                            break;
                        }
                    } catch (e) {
                        // 忽略运算错误
                    }
                }
                if (solutionFound) break;
            }
            if (solutionFound) break;
        }
        
        if (!solutionFound) {
            hintContent += `
                <div class="mt-2">
                    <p class="text-sm text-gray-700">这组牌难以直接用小组凑加法解决。可以尝试其他解法，或者探索更复杂的组合方式。</p>
                </div>
            `;
        }
        
        hint.innerHTML = hintContent;
        hint.classList.remove('hidden');
        return;
    } else if (practiceState.selectedMethod === 'group-subtraction') {
        const hint = document.getElementById('group-subtraction-hint');
        
        // 生成针对当前牌组的小组凑减法提示
        let hintContent = `
            <h3 class="text-lg font-medium text-yellow-800 mb-2">
                <i class="fas fa-lightbulb mr-2"></i> 小组凑减法提示
            </h3>
            <p class="text-sm text-gray-700">对于牌组 [${currentNumbers.join(', ')}]，可以尝试以下思路：</p>
        `;
        
        // 检查所有可能的分组方式
        const allPairs = [
            // (0,1), (2,3)
            {
                pair1: [currentNumbers[0], currentNumbers[1]],
                pair2: [currentNumbers[2], currentNumbers[3]]
            },
            // (0,2), (1,3)
            {
                pair1: [currentNumbers[0], currentNumbers[2]],
                pair2: [currentNumbers[1], currentNumbers[3]]
            },
            // (0,3), (1,2)
            {
                pair1: [currentNumbers[0], currentNumbers[3]],
                pair2: [currentNumbers[1], currentNumbers[2]]
            }
        ];
        
        let solutionFound = false;
        
        for (const group of allPairs) {
            // 尝试不同的运算符
            const operations = [
                { name: '+', func: (a, b) => a + b, symbol: '+' },
                { name: '-', func: (a, b) => a - b, symbol: '-' },
                { name: '-r', func: (a, b) => b - a, symbol: '-' },
                { name: '*', func: (a, b) => a * b, symbol: '×' },
                { name: '/', func: (a, b) => (b !== 0 ? a / b : null), symbol: '÷' },
                { name: '/r', func: (a, b) => (a !== 0 ? b / a : null), symbol: '÷' }
            ];
            
            for (const op1 of operations) {
                for (const op2 of operations) {
                    try {
                        const result1 = op1.func(group.pair1[0], group.pair1[1]);
                        const result2 = op2.func(group.pair2[0], group.pair2[1]);
                        
                        // 检查减法（result1 - result2 = 24 或 result2 - result1 = 24）
                        if (result1 !== null && result2 !== null) {
                            let found = false;
                            let firstResultForDisplay, secondResultForDisplay;
                            let firstOpStr, secondOpStr;
                            
                            if (Math.abs(result1 - result2 - 24) < 0.0001) {
                                firstResultForDisplay = result1;
                                secondResultForDisplay = result2;
                                firstOpStr = (op1.name === '-r' || op1.name === '/r') ? `${group.pair1[1]} ${op1.symbol} ${group.pair1[0]}` : `${group.pair1[0]} ${op1.symbol} ${group.pair1[1]}`;
                                secondOpStr = (op2.name === '-r' || op2.name === '/r') ? `${group.pair2[1]} ${op2.symbol} ${group.pair2[0]}` : `${group.pair2[0]} ${op2.symbol} ${group.pair2[1]}`;
                                found = true;
                            } else if (Math.abs(result2 - result1 - 24) < 0.0001) {
                                firstResultForDisplay = result2;
                                secondResultForDisplay = result1;
                                firstOpStr = (op2.name === '-r' || op2.name === '/r') ? `${group.pair2[1]} ${op2.symbol} ${group.pair2[0]}` : `${group.pair2[0]} ${op2.symbol} ${group.pair2[1]}`;
                                secondOpStr = (op1.name === '-r' || op1.name === '/r') ? `${group.pair1[1]} ${op1.symbol} ${group.pair1[0]}` : `${group.pair1[0]} ${op1.symbol} ${group.pair1[1]}`;
                                found = true;
                            }
                            
                            if (found) {
                                hintContent += `
                                    <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                                        <p class="text-sm text-gray-700"><strong>将牌组分成两对：</strong></p>
                                        <p class="text-sm text-gray-700">运算组1: (${firstOpStr}) = ${firstResultForDisplay.toFixed(2)}</p>
                                        <p class="text-sm text-gray-700">运算组2: (${secondOpStr}) = ${secondResultForDisplay.toFixed(2)}</p>
                                        <p class="text-sm text-gray-700">然后: ${firstResultForDisplay.toFixed(2)} - ${secondResultForDisplay.toFixed(2)} = 24</p>
                                    </div>
                                `;
                                solutionFound = true;
                                break;
                            }
                        }
                    } catch (e) {
                        // 忽略运算错误
                    }
                }
                if (solutionFound) break;
            }
            if (solutionFound) break;
        }
        
        if (!solutionFound) {
            hintContent += `
                <div class="mt-2">
                    <p class="text-sm text-gray-700">这组牌难以直接用小组凑减法解决。可以尝试其他解法，或者探索更复杂的组合方式。</p>
                </div>
            `;
        }
        
        hint.innerHTML = hintContent;
        hint.classList.remove('hidden');
        return;
    } else if (practiceState.selectedMethod === 'group-multiplication') {
        const hint = document.getElementById('group-multiplication-hint');
        
        // 生成针对当前牌组的小组凑乘法提示
        let hintContent = `
            <h3 class="text-lg font-medium text-yellow-800 mb-2">
                <i class="fas fa-lightbulb mr-2"></i> 小组凑乘法提示
            </h3>
            <p class="text-sm text-gray-700">对于牌组 [${currentNumbers.join(', ')}]，可以尝试以下思路：</p>
        `;
        
        // 检查所有可能的分组方式
        const allPairs = [
            // (0,1), (2,3)
            {
                pair1: [currentNumbers[0], currentNumbers[1]],
                pair2: [currentNumbers[2], currentNumbers[3]]
            },
            // (0,2), (1,3)
            {
                pair1: [currentNumbers[0], currentNumbers[2]],
                pair2: [currentNumbers[1], currentNumbers[3]]
            },
            // (0,3), (1,2)
            {
                pair1: [currentNumbers[0], currentNumbers[3]],
                pair2: [currentNumbers[1], currentNumbers[2]]
            }
        ];
        
        let solutionFound = false;
        
        for (const group of allPairs) {
            // 尝试不同的运算符
            const operations = [
                { name: '+', func: (a, b) => a + b },
                { name: '-', func: (a, b) => a - b },
                { name: '-r', func: (a, b) => b - a }, // Reversed subtraction
                { name: '*', func: (a, b) => a * b },
                { name: '/', func: (a, b) => (b !== 0 ? a / b : null) }, // a/b
                { name: '/r', func: (a, b) => (a !== 0 ? b / a : null) }  // b/a
            ];
            
            for (const op1 of operations) {
                for (const op2 of operations) {
                    try {
                        const result1 = op1.func(group.pair1[0], group.pair1[1]);
                        const result2 = op2.func(group.pair2[0], group.pair2[1]);
                        
                        // 检查乘法（result1 * result2 = 24）
                        if (result1 !== null && result2 !== null && Math.abs(result1 * result2 - 24) < 0.0001) {
                            // 找到符合条件的组合
                            let op1Str, op2Str;
                            
                            if (op1.name === '-r') {
                                op1Str = `${group.pair1[1]} ${op1.symbol} ${group.pair1[0]}`;
                            } else if (op1.name === '/r') {
                                op1Str = `${group.pair1[1]} ${op1.symbol} ${group.pair1[0]}`;
                            } else {
                                op1Str = `${group.pair1[0]} ${op1.symbol} ${group.pair1[1]}`;
                            }
                            
                            if (op2.name === '-r') {
                                op2Str = `${group.pair2[1]} ${op2.symbol} ${group.pair2[0]}`;
                            } else if (op2.name === '/r') {
                                op2Str = `${group.pair2[1]} ${op2.symbol} ${group.pair2[0]}`;
                            } else {
                                op2Str = `${group.pair2[0]} ${op2.symbol} ${group.pair2[1]}`;
                            }
                            
                            hintContent += `
                                <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                                    <p class="text-sm text-gray-700"><strong>将牌组分成两对：</strong></p>
                                    <p class="text-sm text-gray-700">第一组: (${op1Str}) = ${result1.toFixed(2)}</p>
                                    <p class="text-sm text-gray-700">第二组: (${op2Str}) = ${result2.toFixed(2)}</p>
                                    <p class="text-sm text-gray-700">然后: ${result1.toFixed(2)} × ${result2.toFixed(2)} = 24</p>
                                </div>
                            `;
                            solutionFound = true;
                            break;
                        }
                    } catch (e) {
                        // 忽略运算错误
                    }
                }
                if (solutionFound) break;
            }
            if (solutionFound) break;
        }
        
        if (!solutionFound) {
            hintContent += `
                <div class="mt-2">
                    <p class="text-sm text-gray-700">这组牌难以直接用小组凑乘法解决。可以尝试其他解法，或者探索更复杂的组合方式。</p>
                </div>
            `;
        }
        
        hint.innerHTML = hintContent;
        hint.classList.remove('hidden');
        return;
    } else if (practiceState.selectedMethod === 'group-division') {
        const hint = document.getElementById('group-division-hint');
        
        // 生成针对当前牌组的小组凑除法提示
        let hintContent = `
            <h3 class="text-lg font-medium text-yellow-800 mb-2">
                <i class="fas fa-lightbulb mr-2"></i> 小组凑除法提示
            </h3>
            <p class="text-sm text-gray-700">对于牌组 [${currentNumbers.join(', ')}]，可以尝试以下思路：</p>
        `;
        
        // 检查所有可能的分组方式
        const allPairs = [
            // (0,1), (2,3)
            {
                pair1: [currentNumbers[0], currentNumbers[1]],
                pair2: [currentNumbers[2], currentNumbers[3]]
            },
            // (0,2), (1,3)
            {
                pair1: [currentNumbers[0], currentNumbers[2]],
                pair2: [currentNumbers[1], currentNumbers[3]]
            },
            // (0,3), (1,2)
            {
                pair1: [currentNumbers[0], currentNumbers[3]],
                pair2: [currentNumbers[1], currentNumbers[2]]
            }
        ];
        
        let solutionFound = false;
        
        for (const group of allPairs) {
            // 尝试不同的运算符
            const operations = [
                { name: '+', func: (a, b) => a + b },
                { name: '-', func: (a, b) => a - b },
                { name: '-r', func: (a, b) => b - a },
                { name: '*', func: (a, b) => a * b },
                { name: '/', func: (a, b) => a !== 0 ? b / a : null },
                { name: '/r', func: (a, b) => b !== 0 ? a / b : null }
            ];
            
            for (const op1 of operations) {
                for (const op2 of operations) {
                    try {
                        const result1 = op1.func(group.pair1[0], group.pair1[1]);
                        const result2 = op2.func(group.pair2[0], group.pair2[1]);
                        
                        if (result1 !== null && result2 !== null && result2 !== 0) {
                            // 检查是否 result1 / result2 = 24 或 result2 / result1 = 24
                            if (Math.abs(result1 / result2 - 24) < 0.0001 || (result1 !== 0 && Math.abs(result2 / result1 - 24) < 0.0001)) {
                                foundGroups = {
                                    pair1: group.pair1,
                                    pair2: group.pair2,
                                    indices1: group.indices1,
                                    indices2: group.indices2,
                                    op1: op1.symbol,
                                    op2: op2.symbol,
                                    result1: result1,
                                    result2: result2
                                };
                                break;
                            }
                        }
                    } catch (e) {
                        // 忽略运算错误
                    }
                }
                if (foundGroups) break;
            }
            if (foundGroups) break;
        }
        
        if (foundGroups) {
            // 构建提示文本
            const op1Display = foundGroups.op1 === '*' ? '×' : (foundGroups.op1 === '/' ? '÷' : foundGroups.op1);
            const op2Display = foundGroups.op2 === '*' ? '×' : (foundGroups.op2 === '/' ? '÷' : foundGroups.op2);
            
            hintContent += `
                <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                    <p class="text-sm text-gray-700"><strong>将牌组分成两对：</strong></p>
                    <p class="text-sm text-gray-700">第一组: (${op1Str}) = ${result1}</p>
                    <p class="text-sm text-gray-700">第二组: (${op2Str}) = ${result2}</p>
                    <p class="text-sm text-gray-700">然后: ${result1} ÷ ${result2} = 24</p>
                </div>
            `;
        } else {
            hintContent += `
                <div class="mt-2">
                    <p class="text-sm text-gray-700">这组牌难以直接用小组凑除法解决。可以尝试其他解法，或者探索更复杂的组合方式。</p>
                </div>
            `;
        }
        
        hint.innerHTML = hintContent;
        hint.classList.remove('hidden');
        return;
    } else if (practiceState.selectedMethod === 'double-replacement') {
        const hintDiv = document.getElementById('double-replacement-hint');
        if (!hintDiv) return;

        // 生成针对当前牌组的两倍关系替换法提示
        let hintContent = `
            <h3 class="text-lg font-medium text-yellow-800 mb-2">
                <i class="fas fa-lightbulb mr-2"></i> 替换法（两倍关系）提示
            </h3>
            <p class="text-sm text-gray-700">对于牌组 [${currentNumbers.join(', ')}]，可以尝试以下思路：</p>
        `;
        
        let doubleRelationships = [];
        for (let i = 0; i < currentNumbers.length; i++) {
            for (let j = 0; j < currentNumbers.length; j++) {
                if (i !== j && Math.abs(currentNumbers[i] - 2 * currentNumbers[j]) < 0.0001) {
                    doubleRelationships.push({
                        bigger: currentNumbers[i],
                        smaller: currentNumbers[j],
                        biggerIndex: i,
                        smallerIndex: j
                    });
                }
            }
        }
        
        if (doubleRelationships.length > 0) {
            for (const relation of doubleRelationships) {
                const bigger = relation.bigger;
                const smaller = relation.smaller;
                const otherIndices = [0, 1, 2, 3].filter(idx => idx !== relation.biggerIndex && idx !== relation.smallerIndex);
                const otherNumbers = otherIndices.map(idx => currentNumbers[idx]);
                
                // 尝试使用替换后的数字计算24点
                let solution = null;
                
                // 尝试用 bigger = smaller + smaller 的形式
                const numbers1 = [smaller, smaller, ...otherNumbers];
                for (let i = 0; i < numbers1.length; i++) {
                    for (let j = i + 1; j < numbers1.length; j++) {
                        for (let k = j + 1; k < numbers1.length; k++) {
                            const a = numbers1[i];
                            const b = numbers1[j];
                            const c = numbers1[k];
                            
                            // 尝试不同的运算组合
                            const operations = ['+', '-', '*', '/'];
                            for (const op1 of operations) {
                                for (const op2 of operations) {
                                    try {
                                        const result1 = calculate(a, op1, b);
                                        if (result1 !== null) {
                                            const result2 = calculate(result1, op2, c);
                                            if (result2 !== null && Math.abs(result2 - 24) < 0.0001) {
                                                solution = {
                                                    type: 'addition',
                                                    expression: `(${a} ${op1} ${b}) ${op2} ${c}`,
                                                    replacement: `${bigger} = ${smaller} + ${smaller}`,
                                                    result: 24
                                                };
                                                break;
                                            }
                                        }
                                    } catch (e) {
                                        // 忽略计算错误
                                    }
                                }
                                if (solution) break;
                            }
                            if (solution) break;
                        }
                        if (solution) break;
                    }
                    if (solution) break;
                }
                
                // 如果第一种方式没找到解，尝试用 smaller = bigger - smaller 的形式
                if (!solution) {
                    const numbers2 = [bigger, bigger - smaller, ...otherNumbers];
                    for (let i = 0; i < numbers2.length; i++) {
                        for (let j = i + 1; j < numbers2.length; j++) {
                            for (let k = j + 1; k < numbers2.length; k++) {
                                const a = numbers2[i];
                                const b = numbers2[j];
                                const c = numbers2[k];
                                
                                const operations = ['+', '-', '*', '/'];
                                for (const op1 of operations) {
                                    for (const op2 of operations) {
                                        try {
                                            const result1 = calculate(a, op1, b);
                                            if (result1 !== null) {
                                                const result2 = calculate(result1, op2, c);
                                                if (result2 !== null && Math.abs(result2 - 24) < 0.0001) {
                                                    solution = {
                                                        type: 'subtraction',
                                                        expression: `(${a} ${op1} ${b}) ${op2} ${c}`,
                                                        replacement: `${smaller} = ${bigger} - ${smaller}`,
                                                        result: 24
                                                    };
                                                    break;
                                                }
                                            }
                                        } catch (e) {
                                            // 忽略计算错误
                                        }
                                    }
                                    if (solution) break;
                                }
                                if (solution) break;
                            }
                            if (solution) break;
                        }
                        if (solution) break;
                    }
                }

                hintContent += `
                    <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                        <p class="text-sm text-gray-700"><strong>找到两倍关系：${bigger} = 2 × ${smaller}</strong></p>
                        <p class="text-sm text-gray-700">可以将 ${bigger} 看作 (${smaller} + ${smaller})，或者将 ${smaller} 看作 (${bigger} - ${smaller})。</p>
                `;

                if (solution) {
                    hintContent += `
                        <div class="mt-2 ml-4">
                            <p class="text-sm text-gray-700"><strong>具体解法：</strong></p>
                            <p class="text-sm text-gray-700">1. ${solution.replacement}</p>
                            <p class="text-sm text-gray-700">2. 使用替换后的数字：${solution.expression} = 24</p>
                            <p class="text-sm text-gray-700">3. 将结果代回原始数字，得到24点解法</p>
                        </div>
                    `;
                } else {
                    hintContent += `
                        <div class="mt-2 ml-4">
                            <p class="text-sm text-gray-700">尝试使用这种替换关系，结合其他运算来构造24点解法。</p>
                        </div>
                    `;
                }

                hintContent += `</div>`;
                break;
            }
        } else {
            hintContent += `
                <div class="mt-2">
                    <p class="text-sm text-gray-700">这组牌 [${currentNumbers.join(', ')}] 中没有明显的两倍关系（一个数是另一个数的两倍）。此方法可能不适用。</p>
                </div>
            `;
        }
        
        hintDiv.innerHTML = hintContent;
        hintDiv.classList.remove('hidden');
        return;
    } else if (practiceState.selectedMethod === 'division-replacement') {
        const hintDiv = document.getElementById('division-replacement-hint');
        if (!hintDiv) return;

        // 生成针对当前牌组的除法替换法提示
        let hintContent = `
            <h3 class="text-lg font-medium text-yellow-800 mb-2">
                <i class="fas fa-lightbulb mr-2"></i> 替换法（除法替换）提示
            </h3>
            <p class="text-sm text-gray-700">对于牌组 [${currentNumbers.join(', ')}]，可以尝试以下思路：</p>
        `;
        
        const replacements = [
            { original: 2, numerator: 4, denominator: 2, name: "4÷2" },
            { original: 3, numerator: 9, denominator: 3, name: "9÷3" },
            { original: 4, numerator: 8, denominator: 2, name: "8÷2" },
            { original: 6, numerator: 12, denominator: 2, name: "12÷2" }
        ];
        
        let replacementFound = false;
        let solution = null;

        for (const replacement of replacements) {
            const originalIndex = currentNumbers.findIndex(num => Math.abs(num - replacement.original) < 0.0001);
            
            if (originalIndex !== -1) {
                const tempNumbers = [...currentNumbers];
                tempNumbers.splice(originalIndex, 1);
                
                // 尝试使用替换后的数字计算24点
                const numbersWithReplacement = [...tempNumbers];
                
                // 尝试两种替换方式：
                // 1. 用除法结果替换原数
                // 2. 用除数和被除数替换原数
                
                // 方式1：直接使用替换结果
                for (let i = 0; i < numbersWithReplacement.length; i++) {
                    for (let j = i + 1; j < numbersWithReplacement.length; j++) {
                        for (let k = j + 1; k < numbersWithReplacement.length; k++) {
                            const a = numbersWithReplacement[i];
                            const b = numbersWithReplacement[j];
                            const c = numbersWithReplacement[k];
                            
                            const operations = ['+', '-', '*', '/'];
                            for (const op1 of operations) {
                                for (const op2 of operations) {
                                    try {
                                        const result1 = calculate(a, op1, b);
                                        if (result1 !== null) {
                                            const result2 = calculate(result1, op2, c);
                                            if (result2 !== null && Math.abs(result2 - 24) < 0.0001) {
                                                solution = {
                                                    type: 'direct',
                                                    expression: `(${a} ${op1} ${b}) ${op2} ${c}`,
                                                    replacement: `${replacement.original} = ${replacement.name}`,
                                                    result: 24
                                                };
                                                break;
                                            }
                                        }
                                    } catch (e) {
                                        // 忽略计算错误
                                    }
                                }
                                if (solution) break;
                            }
                            if (solution) break;
                        }
                        if (solution) break;
                    }
                    if (solution) break;
                }
                
                // 方式2：使用除数和被除数
                if (!solution) {
                    const numbersWithDivision = [...tempNumbers, replacement.numerator, replacement.denominator];
                    for (let i = 0; i < numbersWithDivision.length; i++) {
                        for (let j = i + 1; j < numbersWithDivision.length; j++) {
                            for (let k = j + 1; k < numbersWithDivision.length; k++) {
                                const a = numbersWithDivision[i];
                                const b = numbersWithDivision[j];
                                const c = numbersWithDivision[k];
                                
                                const operations = ['+', '-', '*', '/'];
                                for (const op1 of operations) {
                                    for (const op2 of operations) {
                                        try {
                                            const result1 = calculate(a, op1, b);
                                            if (result1 !== null) {
                                                const result2 = calculate(result1, op2, c);
                                                if (result2 !== null && Math.abs(result2 - 24) < 0.0001) {
                                                    solution = {
                                                        type: 'division',
                                                        expression: `(${a} ${op1} ${b}) ${op2} ${c}`,
                                                        replacement: `${replacement.original} = ${replacement.name}`,
                                                        result: 24
                                                    };
                                                    break;
                                                }
                                            }
                                        } catch (e) {
                                            // 忽略计算错误
                                        }
                                    }
                                    if (solution) break;
                                }
                                if (solution) break;
                            }
                            if (solution) break;
                        }
                        if (solution) break;
                    }
                }

                hintContent += `
                    <div class="mt-2 border-l-2 border-yellow-500 pl-2">
                        <p class="text-sm text-gray-700">发现数字 ${replacement.original} 可以替换为 ${replacement.name}。</p>
                `;

                if (solution) {
                    hintContent += `
                        <div class="mt-2 ml-4">
                            <p class="text-sm text-gray-700"><strong>具体解法：</strong></p>
                            <p class="text-sm text-gray-700">1. ${solution.replacement}</p>
                            <p class="text-sm text-gray-700">2. 使用替换后的数字：${solution.expression} = 24</p>
                            <p class="text-sm text-gray-700">3. 将结果代回原始数字，得到24点解法</p>
                        </div>
                    `;
                } else {
                    hintContent += `
                        <div class="mt-2 ml-4">
                            <p class="text-sm text-gray-700">尝试使用这种替换关系，结合其他运算来构造24点解法。</p>
                        </div>
                    `;
                }

                hintContent += `</div>`;
                replacementFound = true;
                break;
            }
        }
        
        if (!replacementFound) {
            hintContent += `
                <div class="mt-2">
                    <p class="text-sm text-gray-700">这组牌 [${currentNumbers.join(', ')}] 中没有可直接应用的除法替换（如将2替换为4÷2，或3替换为9÷3等）。</p>
                    <p class="text-sm text-gray-700">此方法可能不适用，或需要更复杂的思考。</p>
                </div>
            `;
        }
        
        hintDiv.innerHTML = hintContent;
        hintDiv.classList.remove('hidden');
        return;
    }
    
    // 为其他类型的解法生成动态提示 (This part seems to be a fallback and might need review)
    // const numbers = practiceState.randomCards.map(card => cardValueToNumber(card.value)); // Already defined as currentNumbers
    let hintText = ''; // Default empty hintText
    const fallbackHintDiv = document.getElementById('difference-hint'); // Default to difference hint if no specific selected

    // Fallback logic for other methods or if 'all' is selected and no specific hint is triggered above.
    // This part of the code was very long and repetitive, so I'm simplifying the access to the paragraph.
    // It seems there was an intention to fill a generic paragraph if none of the specific hints were shown.
    // For clarity, ensure that if a specific hint *was* shown (by returning early), this fallback doesn't overwrite it.

    // Display a generic message or a default hint if no specific hint matched and returned.
    // (The original code had a very long series of if/else if for each method again here)
    // We should rely on the early returns for specific methods.
    // If we reach here, it means no specific hint was shown.
    
    // Check if any hint is currently visible. If so, do nothing further.
    const anyHintVisible = Array.from(document.querySelectorAll('.practice-hint')).some(h => !h.classList.contains('hidden'));

    if (!anyHintVisible) { // Only show default if nothing else was shown
        if (fallbackHintDiv) {
            const pTag = fallbackHintDiv.querySelector('p');
            if (pTag) {
                 if (practiceState.selectedMethod === 'all') {
                    pTag.innerHTML = `当前选择了"全部解法"。<br>牌组：[${currentNumbers.join(', ')}]。<br>请尝试使用任意您熟悉的技巧来解题，或选择一个特定的解法进行针对性练习和查看提示。`;
        } else {
                    // This case should ideally not be reached if specific hints handle their methods.
                    // But as a safeguard:
                    pTag.innerHTML = `请为牌组 [${currentNumbers.join(', ')}] 选择一种解法方法以查看针对性提示。`;
                }
            }
            fallbackHintDiv.classList.remove('hidden');
    } else {
            // Fallback if even the default difference-hint isn't found
            console.error("Default hint area 'difference-hint' not found.");
        }
    }
}

// 检查一组数字是否适合使用小组凑加法
function isSuitableForGroupAdditionMethod(numbers) {
    // 检查所有可能的分组方式
    const allPairs = [
        // (0,1), (2,3)
        {
            pair1: [numbers[0], numbers[1]],
            pair2: [numbers[2], numbers[3]],
            indices1: [0, 1],
            indices2: [2, 3]
        },
        // (0,2), (1,3)
        {
            pair1: [numbers[0], numbers[2]],
            pair2: [numbers[1], numbers[3]],
            indices1: [0, 2],
            indices2: [1, 3]
        },
        // (0,3), (1,2)
        {
            pair1: [numbers[0], numbers[3]],
            pair2: [numbers[1], numbers[2]],
            indices1: [0, 3],
            indices2: [1, 2]
        }
    ];
    
    for (const group of allPairs) {
        // 尝试不同的运算符
        const operations = [
            { func: (a, b) => a + b, symbol: '+' },
            { func: (a, b) => a - b, symbol: '-' },
            { func: (a, b) => b - a, symbol: '-' }, // Reversed subtraction
            { func: (a, b) => a * b, symbol: '*' },
            { func: (a, b) => (b !== 0 ? a / b : null), symbol: '/' }, // a/b
            { func: (a, b) => (a !== 0 ? b / a : null), symbol: '/' }  // b/a
        ];
        
        for (const op1 of operations) {
            for (const op2 of operations) {
                try {
                    const result1 = op1.func(group.pair1[0], group.pair1[1]);
                    const result2 = op2.func(group.pair2[0], group.pair2[1]);
                    
                    if (result1 !== null && result2 !== null && Math.abs(result1 + result2 - 24) < 0.0001) {
                        // 找到符合条件的组合
                        return true;
                    }
                } catch (e) {
                    // 忽略运算错误
                }
            }
        }
    }
    
    // 确保存在24点解法 - 这部分逻辑导致了问题，现已修正
    // const solutions = findAllSolutions(numbers);
    // return solutions.length > 0;
    return false; // 如果没有找到小组凑加法的解，则返回false
}

// 检查一组数字是否适合使用小组凑减法
function isSuitableForGroupSubtractionMethod(numbers) {
    // 检查所有可能的分组方式
    const allPairs = [
        // (0,1), (2,3)
        {
            pair1: [numbers[0], numbers[1]],
            pair2: [numbers[2], numbers[3]]
        },
        // (0,2), (1,3)
        {
            pair1: [numbers[0], numbers[2]],
            pair2: [numbers[1], numbers[3]]
        },
        // (0,3), (1,2)
        {
            pair1: [numbers[0], numbers[3]],
            pair2: [numbers[1], numbers[2]]
        }
    ];
    
    for (const group of allPairs) {
        // 尝试不同的运算符
        const operations = [
            { name: '+', func: (a, b) => a + b, symbol: '+' },
            { name: '-', func: (a, b) => a - b, symbol: '-' },
            { name: '-r', func: (a, b) => b - a, symbol: '-' },
            { name: '*', func: (a, b) => a * b, symbol: '×' },
            { name: '/', func: (a, b) => (b !== 0 ? a / b : null), symbol: '÷' },
            { name: '/r', func: (a, b) => (a !== 0 ? b / a : null), symbol: '÷' }
        ];
        
        for (const op1 of operations) {
            for (const op2 of operations) {
                try {
                    const result1 = op1.func(group.pair1[0], group.pair1[1]);
                    const result2 = op2.func(group.pair2[0], group.pair2[1]);
                    
                    if (result1 !== null && result2 !== null) {
                        // 检查是否 result1 - result2 = 24 或 result2 - result1 = 24
                        if (Math.abs(result1 - result2 - 24) < 0.0001 || Math.abs(result2 - result1 - 24) < 0.0001) {
                            return true;
                        }
                    }
                } catch (e) {
                    // 忽略运算错误
                }
            }
        }
    }
    
    // 如果没有找到小组凑减法的解，则返回false
    return false;
}

// 检查一组数字是否适合使用小组凑乘法
function isSuitableForGroupMultiplicationMethod(numbers) {
    // 检查所有可能的分组方式
    const allPairs = [
        // (0,1), (2,3)
        {
            pair1: [numbers[0], numbers[1]],
            pair2: [numbers[2], numbers[3]]
        },
        // (0,2), (1,3)
        {
            pair1: [numbers[0], numbers[2]],
            pair2: [numbers[1], numbers[3]]
        },
        // (0,3), (1,2)
        {
            pair1: [numbers[0], numbers[3]],
            pair2: [numbers[1], numbers[2]]
        }
    ];
    
    for (const group of allPairs) {
        // 尝试不同的运算符
        const operations = [
            { func: (a, b) => a + b },
            { func: (a, b) => a - b },
            { func: (a, b) => b - a }, // Reversed subtraction
            { func: (a, b) => a * b },
            { func: (a, b) => (b !== 0 ? a / b : null) }, // a/b
            { func: (a, b) => (a !== 0 ? b / a : null) }  // b/a
        ];
        
        for (const op1 of operations) {
            for (const op2 of operations) {
                try {
                    const result1 = op1.func(group.pair1[0], group.pair1[1]);
                    const result2 = op2.func(group.pair2[0], group.pair2[1]);
                    
                    if (result1 !== null && result2 !== null && Math.abs(result1 * result2 - 24) < 0.0001) {
                        // 找到符合条件的组合
                        return true;
                    }
                } catch (e) {
                    // 忽略运算错误
                }
            }
        }
    }
    
    // 如果没有找到小组凑乘法的解，则返回false
    return false;
}

// 检查一组数字是否适合使用小组凑除法
function isSuitableForGroupDivisionMethod(numbers) {
    // 检查所有可能的分组方式
    const allPairs = [
        // (0,1), (2,3)
        {
            pair1: [numbers[0], numbers[1]],
            pair2: [numbers[2], numbers[3]]
        },
        // (0,2), (1,3)
        {
            pair1: [numbers[0], numbers[2]],
            pair2: [numbers[1], numbers[3]]
        },
        // (0,3), (1,2)
        {
            pair1: [numbers[0], numbers[3]],
            pair2: [numbers[1], numbers[2]]
        }
    ];
    
    for (const group of allPairs) {
        // 尝试不同的运算符
        const operations = [
            { func: (a, b) => a + b },
            { func: (a, b) => a - b },
            { func: (a, b) => b - a },
            { func: (a, b) => a * b },
            { func: (a, b) => a !== 0 ? b / a : null },
            { func: (a, b) => b !== 0 ? a / b : null }
        ];
        
        for (const op1 of operations) {
            for (const op2 of operations) {
                try {
                    const result1 = op1.func(group.pair1[0], group.pair1[1]);
                    const result2 = op2.func(group.pair2[0], group.pair2[1]);
                    
                    if (result1 !== null && result2 !== null) {
                        // 检查是否 result1 / result2 = 24 或 result2 / result1 = 24
                        if (result2 !== 0 && Math.abs(result1 / result2 - 24) < 0.0001) {
                            return true;
                        }
                        if (result1 !== 0 && Math.abs(result2 / result1 - 24) < 0.0001) {
                            return true;
                        }
                    }
                } catch (e) {
                    // 忽略运算错误
                }
            }
        }
    }
    
    // 确保存在24点解法
    const solutions = findAllSolutions(numbers);
    return solutions.length > 0;
}

// 检查一组数字是否适合使用两倍关系替换法
function isSuitableForDoubleReplacementMethod(numbers) {
    // 寻找两倍关系
    let foundDoublePair = false;
    
    // 查找两倍关系
    for (let i = 0; i < numbers.length; i++) {
        for (let j = 0; j < numbers.length; j++) {
            if (i !== j && Math.abs(numbers[i] - 2 * numbers[j]) < 0.0001) {
                // 找到了数字对，其中numbers[i]是numbers[j]的两倍
                foundDoublePair = true;
                
                // 检查其余数字是否可以与替换后的表达式组合出24
                const otherIndices = [0, 1, 2, 3].filter(idx => idx !== i && idx !== j);
                const otherNumbers = otherIndices.map(idx => numbers[idx]);
                
                // 这里我们简单检查是否有解法，更复杂的检查可能需要实际测试替换后是否有解
                break;
            }
        }
        if (foundDoublePair) break;
    }
    
    if (foundDoublePair) {
        // 确保存在24点解法
        const solutions = findAllSolutions(numbers);
        return solutions.length > 0;
    }
    
    return false;
}

// 检查一组数字是否适合使用除法替换法
function isSuitableForDivisionReplacementMethod(numbers) {
    // 查找是否有2和4，或3和9
    let has2 = false;
    let has4 = false;
    let has3 = false;
    let has9 = false;
    
    for (let i = 0; i < numbers.length; i++) {
        if (Math.abs(numbers[i] - 2) < 0.0001) has2 = true;
        if (Math.abs(numbers[i] - 4) < 0.0001) has4 = true;
        if (Math.abs(numbers[i] - 3) < 0.0001) has3 = true;
        if (Math.abs(numbers[i] - 9) < 0.0001) has9 = true;
    }
    
    const has2and4 = has2 && has4;
    const has3and9 = has3 && has9;
    
    // 检查其余数字是否可以凑出24
    if (has2and4 || has3and9) {
        // 确保存在24点解法
        const solutions = findAllSolutions(numbers);
        return solutions.length > 0;
    }
    
    return false;
}

// 检查一组数字是否适合使用三一加减法
function isSuitableForThreeOneAdditionSubtractionMethod(numbers) {
    // 三一加减法: 固定一个数，用剩余三个数凑出一个数，再通过加减运算得到24
    
    // 为每个数分别检查
    for (let i = 0; i < numbers.length; i++) {
        const fixedNumber = numbers[i];
        const restNumbers = numbers.filter((_, idx) => idx !== i);
        
        // 目标值为 24 + fixedNumber (减法) 或 24 - fixedNumber (加法)
        const targetAdd = 24 - fixedNumber;
        const targetSub = 24 + fixedNumber;
        
        // 检查剩余三个数能否通过四则运算凑出目标值
        if (canMakeTargetValue(restNumbers, targetAdd) || canMakeTargetValue(restNumbers, targetSub)) {
            return true;
        }
    }
    
    return false;
}

// 检查一组数字是否适合使用三一凑除法
function isSuitableForThreeOneDivisionMethod(numbers) {
    // 三一凑除法: 选一个数作为除数，将剩下的三个数凑成这个数与24的积
    
    // 为每个数分别检查
    for (let i = 0; i < numbers.length; i++) {
        const divisor = numbers[i];
        
        // 除数不能为0
        if (divisor === 0) continue;
        
        const restNumbers = numbers.filter((_, idx) => idx !== i);
        const targetProduct = 24 * divisor; // 需要三个数凑出的积
        
        // 检查剩余三个数能否凑出目标值
        if (canMakeTargetValue(restNumbers, targetProduct)) {
            return true;
        }
    }
    
    return false;
}