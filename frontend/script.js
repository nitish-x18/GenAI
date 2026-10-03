const input = document.querySelector('#input');
const chatContainer = document.querySelector('#chat-container');
const askBotton = document.querySelector('#ask');

input.addEventListener('keyup', handleEnter);
askBotton.addEventListener('click', handleAsk);

function genrate(text){

    const msg = document.createElement('div')
    msg.className = 'my-6 bg-neutral-800 p-3 rounded-2xl ml-auto max-w-fit'
    msg.textContent = text

    chatContainer?.appendChild(msg)
    input.value = '';

}

function handleAsk(e){
    const text = input?.value.trim();
    if(!text){
        return;
    }
    genrate(text);
}

function handleEnter(e){
    if(e.key === 'Enter'){
        const text = input?.value.trim();
        if(!text){
            return;
        }

        genrate(text);
        
    }
}