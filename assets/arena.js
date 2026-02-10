let channelSlug = 'human-media' // The “slug” is just the end of the URL.
let myUsername = 'Evgenii Astapov' // For linking to your profile.



// First, let’s lay out some *functions*, starting with our basic metadata:
let placeChannelInfo = (channelData) => {
	// Target some elements in your HTML:
	let channelTitle = document.querySelector('#channel-title')
	let channelDescription = document.querySelector('#channel-description')
	let channelCount = document.querySelector('#channel-count')
	let channelLink = document.querySelector('#channel-link')

	// Then set their content/attributes to our data:
	channelTitle.innerHTML = channelData.title
	channelDescription.innerHTML = channelData.description.html
	channelCount.innerHTML = channelData.counts.blocks
	channelLink.href = `https://www.are.na/channel/${channelSlug}`
}



// Then our big function for specific-block-type rendering:
let renderBlock = (blockData) => {
	let channelBlocks = document.querySelector('#channel-blocks')
	if (!channelBlocks) return

	try {
		// ——— LINK ———
		if (blockData.type == 'Link') {
			let img = blockData.image
			let src = img?.display?.url || img?.large?.src_2x || ''
			let linkItem = `
				<li>
					<p><em>Link</em></p>
					<figure>
						${src ? `<img alt="${img?.alt_text || ''}" src="${src}">` : ''}
						<figcaption><h3>${blockData.title || ''}</h3>${blockData.description?.html || ''}</figcaption>
					</figure>
					${blockData.source?.url ? `<p><a href="${blockData.source.url}" target="_blank" rel="noopener">See the original ↗</a></p>` : ''}
				</li>`
			channelBlocks.insertAdjacentHTML('beforeend', linkItem)
		}

		// ——— IMAGE ———
		else if (blockData.type == 'Image') {
			let img = blockData.image
			let src = img?.display?.url || img?.original?.url || img?.large?.src_2x || ''
			if (!src) return
			let imageItem = `<li><p><em>Image</em></p><figure><img src="${src}" alt="${img?.alt_text || ''}" loading="lazy">${blockData.title ? `<figcaption>${blockData.title}</figcaption>` : ''}</figure></li>`
			channelBlocks.insertAdjacentHTML('beforeend', imageItem)
		}

		// ——— TEXT ———
		else if (blockData.type == 'Text') {
			let content = blockData.content || blockData.description?.html || ''
			if (!content) return
			let textItem = `<li><p><em>Text</em></p><div class="block-text">${content}</div></li>`
			channelBlocks.insertAdjacentHTML('beforeend', textItem)
		}

		// ——— ATTACHMENT (uploaded file: video, pdf, audio) ———
		else if (blockData.type == 'Attachment') {
			let contentType = blockData.attachment?.content_type || ''
			let url = blockData.attachment?.url || ''
			if (!url) return

			if (contentType.includes('video')) {
				channelBlocks.insertAdjacentHTML('beforeend', `<li><p><em>Video</em></p><video controls src="${url}"></video></li>`)
			}
			else if (contentType.includes('pdf')) {
				channelBlocks.insertAdjacentHTML('beforeend', `<li><p><em>PDF</em></p><p><a href="${url}" target="_blank" rel="noopener">View PDF ↗</a></p></li>`)
			}
			else if (contentType.includes('audio')) {
				channelBlocks.insertAdjacentHTML('beforeend', `<li><p><em>Audio</em></p><audio controls src="${url}"></audio></li>`)
			}
		}

		// ——— EMBED (YouTube, Spotify, etc.) ———
		else if (blockData.type == 'Embed') {
			let html = blockData.embed?.html || ''
			let embedType = blockData.embed?.type || ''
			if (html && (embedType.includes('video') || embedType.includes('rich'))) {
				channelBlocks.insertAdjacentHTML('beforeend', `<li><p><em>Embed</em></p><div class="block-embed">${html}</div></li>`)
			}
		}
	} catch (err) {
		console.warn('Skip block:', blockData.id, err)
	}
}



// A function to display the owner/collaborator info:
let renderUser = (userData) => {
	let channelUsers = document.querySelector('#channel-users') // Container.

	let userAddress =
		`
		<address>
			<img src="${ userData.avatar }">
			<h3>${ userData.name }</h3>
			<p><a href="https://are.na/${ userData.slug }">Are.na profile ↗</a></p>
		</address>
		`

	channelUsers.insertAdjacentHTML('beforeend', userAddress)
}



// Finally, a helper function to fetch data from the API, then run a callback function with it:
let fetchJson = (url, callback) => {
	fetch(url, { cache: 'no-store' })
		.then((response) => response.json())
		.then((json) => callback(json))
}

// More on `fetch`:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch



// Now that we have said all the things we *can* do, go get the channel data:
fetchJson(`https://api.are.na/v3/channels/${channelSlug}`, (json) => {
	console.log(json) // Always good to check your response!

	placeChannelInfo(json) // Pass all the data to the first function, above.
	renderUser(json.owner) // Pass just the nested object `.owner`.
})

// Get your info to put with the owner's:
fetchJson(`https://api.are.na/v3/users/${myUsername}/`, (json) => {
	console.log(json) // See what we get back.

	renderUser(json) // Pass this to the same function, no nesting.
})

// And the data for the blocks:
fetchJson(`https://api.are.na/v3/channels/${channelSlug}/contents?per=100&sort=position_desc`, (json) => {
	console.log(json) // See what we get back.

	// Loop through the nested `.data` array (list).
	json.data.forEach((blockData) => {
		// console.log(blockData) // The data for a single block.

		renderBlock(blockData) // Pass the single block’s data to the render function.
	})
})
