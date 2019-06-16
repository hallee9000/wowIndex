function sendToken() {
	var token = localStorage.getItem('access-token')
	chrome.runtime.sendMessage({
		reqToken: token
	})
}

sendToken()
