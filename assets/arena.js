let channelSlug = 'human-media' // The “slug” is just the end of the URL.
let myUsername = 'maika-sacerdote'

// First, let’s lay out some *functions*, starting with our basic metadata:
let placeChannelInfo = (channelData) => {
	// Target some elements in your HTML:
	let channelTitle = document.querySelector('#channel-title')
	let channelLink = document.querySelector('#channel-link')
	channelTitle.innerHTML = channelData.title
	channelLink.href = `https://www.are.na/channel/${channelSlug}`
}



// Then our big function for specific-block-type rendering:
let renderBlock = (blockData) => {
	let channelBlocks = document.querySelector('#channel-blocks')
	if (blockData.type == 'Link') {

		let linkItem = `
			<li>
				<p><em>Link</em></p>
				<figure>
					<picture>
						<source media="(width < 500px)" srcset="${blockData.image.small.src_2x}">
						<source media="(width < 1000px)" srcset="${blockData.image.medium.src_2x}">
						<img alt="${blockData.image.alt_text}" src="${blockData.image.large.src_2x}">
					</picture>
					<figcaption>
						<h3>
							${blockData.title
				? blockData.title // If `blockData.title` exists, do this.
				: `Untitled` // Otherwise do this.

			}
						</h3>
						${blockData.description // Here, checks for the object; could also write `blockData.description?.html`.
				? `<div>${blockData.description.html}</div>` // Wrap/interpolate the HTML.
				: `` // Our “otherwise” can also be blank!
			}
					</figcaption>
				</figure>
				<p><a href="${blockData.source.url}">See the original ↗</a></p>
			</li>
			`

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


	// TEXT
	// If textHtml is empty or doesn't exist, try getting the text
	// from another place in the block (description.html).
	// The ?. makes sure the code doesn’t crash if description doesn’t exist.
	else if (blockData.type == 'Text') {
		let textHtml = blockData.content
		if (typeof textHtml === 'object') {
			textHtml = textHtml.html
		}

		if (!textHtml) {
			textHtml = blockData.description?.html
		}

		let textItem = `
    <li>
      <p><em>Text</em></p>
      <div class="block-text">
        ${textHtml}
      </div>
    </li>
  `

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
		// else if (contentType.includes('audio')) {
		// 	channelBlocks.insertAdjacentHTML('beforeend', `<li><p><em>Audio</em></p><audio controls src="${url}"></audio></li>`)
		// }

		else if (contentType.includes('audio')) {
			let audioItem = `
    <li class="block block--audio">
      <p><em>Audio</em></p>

      <div class="audio-ui">
        <div class="audio-controls">
          <button class="audio-btn audio-prev" type="button" aria-label="Previous">⏮</button>

          <button class="audio-btn audio-play" type="button" aria-label="Play/Pause">▶</button>

          <button class="audio-btn audio-next" type="button" aria-label="Next">⏭</button>
        </div>

        <audio class="audio-el" src="${blockData.attachment.url}"></audio>
      </div>
    </li>
  `
			channelBlocks.insertAdjacentHTML('beforeend', audioItem)
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
}


// A function to display the owner/collaborator info:
let renderUser = (userData) => {
	let channelUsers = document.querySelector('#channel-users') // Container.

	let userAddress =
		`
		<address>
		
			<h3>${userData.name}</h3>
			<p><a href="https://are.na/${userData.slug}">Are.na profile ↗</a></p>
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

	// // Loop through all blocks and give earlier ones a higher z-index
	// So the first blocks appear on top of the others.

	let blocks = document.querySelectorAll('#channel-blocks > li')

	blocks.forEach((block, index) => {
		let baseZ = blocks.length - index
		block.dataset.baseZ = baseZ
		block.style.setProperty('--z', baseZ)

	})

	// scroll highlight: rotate + bring to front
	let activeClass = 'active-block'
	let topZ = blocks.length


	blocks.forEach((block) => {
		let blockObserver = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return

			// run only once per block
			if (block.dataset.stuck === 'true') return
			block.dataset.stuck = 'true'

			// bring it to the front permanently
			topZ += 1
			block.style.setProperty('--z', topZ)

			// keeps the rotated state permanently
			block.classList.add('stays')

		}, {
			root: null,
			rootMargin: '-35% 0% -35% 0%',
		})

		blockObserver.observe(block)
	})
})




let modalButton = document.querySelector('#info-modal')
let modalDialog = document.querySelector('#dialog')
let closeButton = modalDialog.querySelector('button')


//  event.preventDefault() is used so the link doesn’t do its default action (going to # and jumping to the page top) we only want to open the popup.
modalButton.addEventListener('click', (event) => {
	event.preventDefault()
	modalDialog.showModal()
})

closeButton.addEventListener('click', () => {
	modalDialog.close()
})

document.addEventListener('click', (event) => {
	if (event.target === document.documentElement) {
		modalDialog.close()
	}
})



//make audio play and stop

document.addEventListener('click', (event) => {
	const playBtn = event.target.closest('.audio-play')
	if (!playBtn) return

	const ui = playBtn.closest('.audio-ui')
	const audio = ui.querySelector('.audio-el')

	if (audio.paused) {
		audio.play()
		playBtn.textContent = '⏸'
	} else {
		audio.pause()
		playBtn.textContent = '▶'
	}
})


// Real World / Dream World toggle
// When a header button is clicked, the code checks if it’s Dream or Real. It then updates the body class to switch the design and highlights the selected button.
// const creates a variable that cannot be changed to something else later.
document.querySelectorAll('.header-btn').forEach((btn) => {
	btn.addEventListener('click', () => {
		const isDream = btn.dataset.world === 'dream'
		document.body.classList.toggle('dream-world', isDream)
		document.querySelectorAll('.header-btn').forEach((b) => b.classList.remove('active'))
		if (isDream) document.querySelector('.header-btn[data-world="dream"]').classList.add('active')
		else document.querySelector('.header-btn[data-world="real"]').classList.add('active')
	})
})


// Set initial view to Real World (no dream-world class on body) and highlight that button; ?. = only run if the button exists.
document.body.classList.remove('dream-world')
document.querySelector('.header-btn[data-world="real"]')?.classList.add('active')






