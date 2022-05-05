const fiberyAccount = 'bloggerslab'
const mainContent = document.getElementById('main-content');
let transcriptFoundResultElement;
let fiberyTokenInput;
let conversationIdInput;
let exportTranscriptButton;
let currentTabId;
let exportResultMessageElement;
let documentSecretObtainResultMessageElement;

function checkIfDovetailTranscriptAvailable() {
    const dovetailDomain = "dovetailapp.com"
    const dovetailTranscriptElementClass = "c60"
    const dovetailTranscriptEntryElementClass = "c14"

    const weAreInDovetail = window.location.hostname === dovetailDomain
    const transcriptAvailable = Boolean(document.getElementsByClassName(dovetailTranscriptElementClass).length)
    const transcriptIsNotEmpty = Boolean(document.getElementsByClassName(dovetailTranscriptEntryElementClass).length)

    if (weAreInDovetail && transcriptAvailable && transcriptIsNotEmpty) {
        return 'Transcript found 👍'
    }
    if (!weAreInDovetail) {
        return 'We are not in Dovetail 😿'
    }
    if (!transcriptAvailable) {
        return 'Transcript is not available 😩'
    }
    if (!transcriptIsNotEmpty) {
        return 'Transcript is empty 🤔'
    }
    return 'Something went wrong 🤬'
}

function getReplicaElements() {
    function parseReplicas(replicas) {
        const structuredTranscriptReplicas = []
        for (const replica of replicas) {
            const personName = replica.querySelector("div.c15 div[role='button']").textContent
            const replicaText = replica.querySelector("div.c16").textContent
            structuredTranscriptReplicas.push([personName, replicaText])
        }
        return structuredTranscriptReplicas
    }

    const dovetailTranscriptEntryElementClass = "c14"
    return parseReplicas(document.getElementsByClassName(dovetailTranscriptEntryElementClass))
}

function convertReplicasToMarkdown(parsedReplicas) {
    let resultMarkdownDoc = ''
    for (const parsedReplica of parsedReplicas) {
        const [personName, replicaText] = parsedReplica
        resultMarkdownDoc += `\n\n**${personName}:** ${replicaText}`
    }
    return resultMarkdownDoc
}

async function getTargetConversationDocumentSecret(conversationPublicId, fiberyToken) {
    const fiberyCommands = [{
        command: "fibery.entity/query", args: {
            query: {
                "q/from": "Customer Development/Conversation",
                "q/select": ["fibery/id", {"Customer Development/Feedback Notes": ["Collaboration~Documents/secret"]}],
                "q/where": ["=", ["fibery/public-id"], "$publicid"],
                "q/limit": 1
            }, params: {
                "$publicid": conversationPublicId
            }
        }
    }]

    const response = await (await fetch(`https://${fiberyAccount}.fibery.io/api/commands`, {
        headers: {
            'Authorization': `Token ${fiberyToken}`, 'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(fiberyCommands)
    })).json()
    return response[0].result?.[0]?.['Customer Development/Feedback Notes']?.['Collaboration~Documents/secret']
}

async function updateFiberyDocument(documentSecret, documentContent, fiberyToken) {
    const response = await fetch(`https://${fiberyAccount}.fibery.io/api/documents/${documentSecret}?format=md`, {
        headers: {
            'Authorization': `Token ${fiberyToken}`,
            'Content-Type': 'application/json',
        }, method: 'PUT', body: JSON.stringify({content: documentContent})
    })
    return await response.json()
}

async function saveUserFiberyToken(fiberyToken) {
    return chrome.storage.sync.set({fiberyToken: fiberyToken})
}

async function retrieveUserFiberyToken() {
    return (await chrome.storage.sync.get(['fiberyToken'])).fiberyToken
}

async function exportTranscript() {
    const fiberyToken = fiberyTokenInput.value
    await saveUserFiberyToken(fiberyToken)
    const conversationId = conversationIdInput.value

    chrome.scripting.executeScript({
        target: {tabId: currentTabId}, func: getReplicaElements
    }, async (results) => {
        let replicaFoundResult;
        for (const result of results) {
            if (typeof result.result === 'object') {
                replicaFoundResult = result.result
            }
        }
        const replicasInMarkdown = convertReplicasToMarkdown(replicaFoundResult)
        const documentSecret = await getTargetConversationDocumentSecret(conversationId, fiberyToken)
        if (exportResultMessageElement) {
            mainContent.removeChild(exportResultMessageElement)
            exportResultMessageElement = undefined;
        }
        if (documentSecretObtainResultMessageElement) {
            mainContent.removeChild(documentSecretObtainResultMessageElement)
            documentSecretObtainResultMessageElement = undefined;
        }
        if (!documentSecret) {
            documentSecretObtainResultMessageElement = document.createElement('div')
            documentSecretObtainResultMessageElement.textContent = 'Ooops, failed to obtain conversation document 💀'
            mainContent.appendChild(documentSecretObtainResultMessageElement)
            return
        }
        const updateResult = await updateFiberyDocument(documentSecret, replicasInMarkdown, fiberyToken)
        if (exportResultMessageElement) {
            mainContent.removeChild(exportResultMessageElement)
            exportResultMessageElement = undefined;
        }
        const exportResultMessageText = updateResult ? 'Exported successfully ✅' : 'Ooops, export error 🤯';
        exportResultMessageElement = document.createElement('div')
        exportResultMessageElement.textContent = exportResultMessageText
        mainContent.appendChild(exportResultMessageElement)
    })
}

chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
    currentTabId = tabs[0].id
    chrome.scripting.executeScript({
        target: {tabId: currentTabId}, func: checkIfDovetailTranscriptAvailable
    }, async (results) => {
        let transcriptFoundResult;
        for (const result of results) {
            if (typeof result.result === 'string') {
                transcriptFoundResult = result.result
            }
        }
        if (!transcriptFoundResult) {
            transcriptFoundResult = 'Something went wrong 🤬'
        }

        transcriptFoundResultElement = document.createElement('div')
        transcriptFoundResultElement.textContent = transcriptFoundResult.toString()
        mainContent.appendChild(transcriptFoundResultElement)

        if (transcriptFoundResult === 'Transcript found 👍') {
            fiberyTokenInput = document.createElement('input')
            fiberyTokenInput.placeholder = 'Fibery Token 🔑'
            const fiberyToken = await retrieveUserFiberyToken()
            if (fiberyToken) {
                fiberyTokenInput.value = fiberyToken
            }
            mainContent.appendChild(fiberyTokenInput)

            conversationIdInput = document.createElement('input')
            conversationIdInput.placeholder = 'Conversation Public Id 💬'
            mainContent.appendChild(conversationIdInput)

            exportTranscriptButton = document.createElement('button')
            exportTranscriptButton.textContent = 'Export Transcript ⬇️'
            exportTranscriptButton.addEventListener('click', exportTranscript)
            mainContent.appendChild(exportTranscriptButton)
        }
    })
})

