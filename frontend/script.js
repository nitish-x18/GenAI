const input = document.querySelector('#input');
const chatContainer = document.querySelector('#chat-container');
const askBotton = document.querySelector('#ask');

input.addEventListener('keyup', handleEnter);
askBotton.addEventListener('click', handleAsk);

const loading = document.createElement('div');
loading.className = 'my-6 text-gray-500'
loading.textContent = 'thinking...'

async function genrate(text){

    const msg = document.createElement('div')
    msg.className = 'my-6 bg-neutral-800 p-3 rounded-2xl ml-auto max-w-fit'
    msg.textContent = text

    chatContainer?.appendChild(msg)
    input.value = '';

    chatContainer.appendChild(loading);

    // call server
    const assistantMessage = await callServer(text);

    const assistantElem = document.createElement('div')
    assistantElem.className = 'max-w-fit'
    assistantElem.textContent = assistantMessage

    loading.remove();

    chatContainer?.appendChild(assistantElem)
    input.value = '';


}

async function callServer(inputText){
    const response = await fetch('http://localhost:3001/chat', {
        method: "POST",
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            message: inputText
        })
    });

    if(!response.ok) {
        throw new Error("Error generating the response.")
    }

    const result = await response.json()
    return result.message;

}

async function handleAsk(e){
    const text = input?.value.trim();
    if(!text){
        return;
    }
    await genrate(text);
}

async function handleEnter(e){
    if(e.key === 'Enter'){
        const text = input?.value.trim();
        if(!text){
            return;
        }

        await genrate(text);
        
    }
}