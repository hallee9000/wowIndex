var resultEle = document.querySelector('.wow-index')
var tipEle = document.querySelector('.wow-description')
var btn = document.querySelector('.wow-button button')
var likedPosts = []

function getNotification(token, loadMoreKey) {
		var data = {
			loadMoreKey: loadMoreKey || ''
		}
		var fetchHeaders = new Headers({
			'x-jike-access-token': token,
			'app-version': '4.11.0',
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': 'https://app.jike.ruguoapp.com'
		})
		return fetch('https://app.jike.ruguoapp.com/1.0/notifications/list', {
			method: 'POST',
			mode: 'cors',
			headers: fetchHeaders,
			body: JSON.stringify(data)
		})
			.then(function(res) {
				return res.json();
			})
			.catch(function(err) {
				console.error(err);
				return {data: []};
			})
			.then(function(res) {
				if (res.loadMoreKey) {
					calcWowLiked(res.data)
					getNotification(token, res.loadMoreKey)
				} else {
					tipEle.innerText = '上面是我的瓦数'
					resultEle.innerText = likedPosts.length+'瓦'
					btn.style.opacity = 0
				}
			})
}

function calcWowLiked(data) {
	data
		.map(function (noti) {
			var isPostLiked = noti.type==='LIKE_PERSONAL_UPDATE'
			var isCommentLiked = noti.type==='LIKE_PERSONAL_UPDATE_COMMENT'
			if (isPostLiked || isCommentLiked) {
				var likedItems = noti.actionItem.users.filter(function (user) {
					return user.id === '553610b2e4b0825685fd170c'
				})
				if (likedItems.length) {
					likedPosts.push(noti)
				}
			}
		})
	return likedPosts
}

function bindBtn(token) {
	btn.addEventListener('click', function() {
		this.disabled = true
		tipEle.innerText = '正在计算中……'
		getNotification(token)
	})
}

function getMessageAndAct () {
	chrome.tabs.executeScript({
		file: 'getToken.js'
	})

	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse) {
			var token = request.reqToken
			if (!token) {
				tipEle.innerText = '请先登录网页版'
				btn.style.opacity = 0
			}
			bindBtn(token)
			return true;
		}
	)
}

chrome.tabs.query(
	{active: true},
	function (tabs) {
		var jikeTabs = tabs.filter(function(tab){
			return /https:\/\/web\.okjike\.com/.test(tab.url)
		})
		if (jikeTabs.length) {
			getMessageAndAct()
		} else {
			var newURL = "https://web.okjike.com/";
			chrome.tabs.create({ url: newURL });
		}
	}
)

