function main() {
    const cells = document.querySelectorAll(".hex")
    const val = document.querySelector('.input-text');
    const delButton = document.querySelector(".delete")
    const enterButton = document.querySelector('.enter')
    const progressBar = document.querySelector(".progress-bar");
    const addFoundWord = document.querySelector('.words');
    const customAle = document.querySelector('#myAlert');
    const ani = document.querySelector(".ani");
    const refresh = document.querySelector('.refresh');

    let stack = [], mapHex = {};

    const showAlert = (content) => {
        customAle.classList.remove('hideAle')
        customAle.classList.add("showAle");
        customAle.textContent = content;
        setTimeout(() => customAle.classList.add('hideAle'), 3000);
    }

    const clickHex = (cell) => {
        cell.classList.add('pre');
        cell.classList.remove('aft');
        setTimeout(() => cell.classList.remove('pre'), 1000);
        setTimeout(() => cell.classList.add('aft'), 1000);
    }
    const showProgress = (totalMark) => {
        progressBar.style.width = totalMark + "" + '%';
        progressBar.textContent = totalMark + "" + '%';
    }
    const cusDiv = (word) => {
        let div = document.createElement('div');
        div.textContent = word[0].toUpperCase() + word.slice(1,);
        addFoundWord.append(div)
    };

    const checkMarks = (isWin) => {
        if (parseInt(localStorage.getItem('marks')) >= 100 || isWin) {
            cells[0].parentElement.style.display = 'none';
            let div = document.createElement("div")
            div.textContent = 'You have successfully finished the game!!!.Come again for tomorrow!!!';
            ani.classList.add("showAni");
            ani.classList.remove('hideAni')
            div.className = 'end';
            enterButton.style.display = 'none';
            delButton.style.display = 'none';
            document.body.append(div);
        } else {
            if (ani.classList.contains("showAni")) {
                ani.classList.remove("showAni");
                ani.classList.add('hideAni')
            }
        }
    }

    const delWords = () => {
        for (let i = 0; i < stack.length; i++)
            val.removeChild(val.lastChild);
        stack = [];
    }

    const checkLen = () => {
        if (stack.length >= 12) {
            showAlert('Too lengthy!!!');
            delWords();
        }
    }

    const init = async () => {
        let res = await fetch('https://wordhunt.azurewebsites.net/api/init', {
            headers: {
                "Accept-Content": 'application/json',
                "Access-Control-Allow-Origin": "https://wordhunt.azurewebsites.net",
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({ data: "data" })
        })
        res = await res.json()
        let isWin = res.isWin;
        if (res.words.length >= 1) {
            localStorage.setItem('words', res.words.join())
            addFoundWord.previousElementSibling.textContent = `You have found ${res.words.length} words`
        } else {
            try {
                localStorage.removeItem('words')
            } catch { };
        }
        localStorage.setItem('marks', res.marks);
        progressBar.style.width = `${res.marks}%`
        progressBar.textContent = `${res.marks}%`;
        try {
            for (let i of localStorage.getItem('words').split(','))
                cusDiv(i);
            checkMarks(isWin);
        } catch (e) { }
    }
    init()

    const addWord = (word, totalMark, isWin = false) => {
        if (localStorage.getItem('words') === null) {
            localStorage['words'] = [word];
            localStorage['marks'] = totalMark;
            showAlert("Word Found!!!")
            showProgress(totalMark);
            cusDiv(word);
            addFoundWord.previousElementSibling.textContent = `You have found 1 word`
        }
        else {
            let l = localStorage.getItem('words').split(',')
            if (l.includes(word.toLowerCase())) {
                showAlert("Word already found!!!")
            }
            else {
                l.push(word)
                localStorage.setItem("words", l);
                localStorage.setItem('marks', totalMark);
                showAlert("Word Found!!!");
                showProgress(totalMark);
                cusDiv(word);
                checkMarks(isWin);
                addFoundWord.previousElementSibling.textContent = `You have found ${l.length} words`
            }
        }
    }

    for (let cell of cells) {
        mapHex[cell.textContent.trim()] = cell;
        cell.addEventListener('click', (e) => {
            stack.push(cell.textContent.trim())
            let span = document.createElement('span');
            span.className = crypto.randomUUID()
            span.classList.add('aft-text');
            span.textContent = cell.textContent.trim()
            val.appendChild(span);
            if (stack.length === 1)
                val.classList.add('aft-text')
            clickHex(cell);
            checkLen();
        })
    }
    delButton.addEventListener('click', () => {
        stack.pop();
        if (val.children.length)
            val.removeChild(val.lastChild);
    })

    const checkWord = async () => {
        let data = await fetch("https://wordhunt.azurewebsites.net/api/check", {
            headers: {
                "Accept-Content": 'application/json',
                "Access-Control-Allow-Origin": "https://wordhunt.azurewebsites.net",
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({ "data": stack.toString().replaceAll(",", "") })
        })
        return await data.json()
    }

    enterButton.addEventListener('click', async () => {
        let data, f = 0;
        if (stack.includes(cells[3].textContent.trim()) === false || stack.length === 0) {
            showAlert('Invalid Word!!!');
            delWords();
            return;
        }
        if ('words' in localStorage) {
            let l = localStorage.getItem('words').replaceAll('', '').split(',')
            if (l.includes(stack.toString().trim().replaceAll(",", "").toLowerCase()) && l.length >= 1) {
                showAlert("Word already found!!!");
                delWords();
                f = 1;
            }

        } if (f === 0) {
            data = await checkWord();
            if ('error' in data)
                showAlert("Word not Found!!!");
            else
                addWord(stack.toString().trim().replaceAll(",", "").toLowerCase(), data.totalMark, data.isWin);
            delWords();
        }
    })

    refresh.addEventListener('click', () => {
        const letters = []
        cells.forEach((e, idx) => {
            if (idx !== 3) letters.push(e.textContent.trim());
        })
        for (let i = 5; i > 0; i--) {
            let idx = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[idx]] = [letters[idx], letters[i]];
        }
        cells.forEach((e, idx) => {
            if (idx !== 3) e.textContent = letters.shift();
        })
    })

    window.addEventListener("keyup", async (e) => {
        if (e.key === 'Backspace') {
            stack.pop();
            if (val.children.length)
                val.removeChild(val.lastChild);
        }
        else if (e.key === 'Enter') {
            let data, f = 0;
            if (stack.includes(cells[3].textContent.trim()) === false) {
                showAlert('Invalid Word!!!')
                f += 1
            }
            if ('words' in localStorage) {
                let l = localStorage.getItem('words').split(',')
                if (l.includes(stack.toString().trim().replaceAll(",", "").toLowerCase())) {
                    showAlert("Word already found")
                    f += 1;
                }
            }
            if (f === 0) {
                data = await checkWord();
                if ('error' in data)
                    showAlert('Word not Found!!!')
                else
                    addWord(stack.toString().trim().replaceAll(",", "").toLowerCase(), data.totalMark, data.isWin)
            }
            delWords()
        }

        else if (e.key !== 'Enter' && !("abcdefghijklmnopqrstuvwxyz".split('').includes(e.key))) {
        }
        else {
            stack.push(e.key.toUpperCase())
            let span = document.createElement('span');
            span.className = crypto.randomUUID()
            span.classList.add('aft-text');
            span.textContent = e.key.toUpperCase();
            val.appendChild(span);
            if (e.key.toUpperCase() in mapHex)
                clickHex(mapHex[e.key.toUpperCase()]);
        }
        checkLen();
        if (stack.length === 1)
            val.classList.add('aft-text')
    })
}
main()