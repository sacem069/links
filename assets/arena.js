let channelSlug = 'human-media' // The “slug” is just the end of the URL.
let myUsername = 'maika-sacerdote'

// First, let’s lay out some *functions*, starting with our basic metadata:
let placeChannelInfo = (channelData) => {
	let channelTitle = document.querySelector('#channel-title')
	let channelLink = document.querySelector('#channel-link')
	if (channelTitle) channelTitle.innerHTML = channelData.title
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
				<p><a href="${blockData.source.url}">See the original</a></p>
			</li>
			`

		channelBlocks.insertAdjacentHTML('beforeend', linkItem)
	}


	// ——— IMAGE ———
	// If the block is an image, get its image data
	// Use optional chaining to safely access different image sizes
	// Try display first, then fallback options
	// If no image source exists, stop to prevent broken content
	// Create the HTML structure for the image block, including a caption if the title exists
	// Insert the image block into the page
	else if (blockData.type == 'Image') {
		let img = blockData.image
		let src = img?.display?.url || img?.original?.url || img?.large?.src_2x || ''
		if (!src) return
		let label = blockData.title || 'image'
		let imageItem = `<li class="block block--image"><p><em>${label}</em></p><figure><img src="${src}" alt="${img?.alt_text || ''}" loading="lazy">${blockData.title ? `<figcaption>${blockData.title}</figcaption>` : ''}</figure></li>`
		channelBlocks.insertAdjacentHTML('beforeend', imageItem)
	}


	// TEXT
	// If the block is text, get its content. If it comes as an object, extract the HTML. If there is no main content, use the description as a fallback. Build the HTML structure dynamically and insert it into the page.
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
	// If the block is an attachment, get its file type and URL. Use optional chaining to avoid errors if the attachment or its properties are missing. If there is no URL, stop to prevent broken content. Depending on the file type, create the appropriate HTML structure (video player, PDF link, audio player) and insert it into the page.

	else if (blockData.type == 'Attachment') {
		let contentType = blockData.attachment?.content_type || ''
		let url = blockData.attachment?.url || ''
		if (!url) return

		if (contentType.includes('video')) {
			channelBlocks.insertAdjacentHTML('beforeend', `<li><p><em>Video</em></p><video controls autoplay muted loop playsinline src="${url}"></video></li>`)
		}
		else if (contentType.includes('pdf')) {
			channelBlocks.insertAdjacentHTML('beforeend', `<li><p><em>PDF</em></p><p><a href="${url}" target="_blank" rel="noopener">View PDF</a></p></li>`)
		}


		// If the attachment is an audio file, create a custom audio player. Build the HTML structure with custom contols (previous, play, next). Created buttons which will trigger Javascript actions. aria-lavel improves accessibilitu for screen readers.  Use the attachment URL as the audio source. Finally inserted the new audio block into the page. 

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
// If the block is an embed (YouTube, Spotify, etc.), get its HTML and type from the API. Only render it if it contains valid HTML and is a video or rich media (rich media is interactive or dynamic content). Then, insert the imbed inside a styled container block. 

	else if (blockData.type == 'Embed') {
	let html = blockData.embed?.html || ''
	let embedType = blockData.embed?.type || ''
	if (html && (embedType.includes('video') || embedType.includes('rich'))) {
		channelBlocks.insertAdjacentHTML('beforeend', `<li><p><em>Embed</em></p><div class="block-embed">${html}</div></li>`)
	}
}
}


// A function to display the owner/collaborator info. Select the container where user profiles will appear. Build the HTML using the user's name and slug. Insert the profile into the page. 
let renderUser = (userData) => {
	let channelUsers = document.querySelector('#channel-users') // Container.

	let userAddress =
		`
		<address>
		
			<h3>${userData.name}</h3>
			<p><a href="https://are.na/${userData.slug}">Are.na profile</a></p>
		</address>
		`

	channelUsers.insertAdjacentHTML('beforeend', userAddress)
}



// Finally, a helper function to fetch data from the API, then run a callback function with it:
//What cahe: no store is doing is telling the browser not store this response. Always request fresh data from the server. 
// Converts the response into Json
// Passes the JSON data to a callback function for further processing

let fetchJson = (url, callback) => {
	fetch(url, { cache: 'no-store' })
		.then((response) => response.json())
		.then((json) => callback(json))
}

// More on `fetch`:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch



// Fetch channel data from the Are.na API. Then it logs the response to inspect its structure. Then passes the full channel data to the `placeChannelInfo` function to update the channel info on the page. It also passes the nested owner object to the `renderUser` function to display the user profile.

fetchJson(`https://api.are.na/v3/channels/${channelSlug}`, (json) => {
	console.log(json) 

	placeChannelInfo(json) // Pass all the data to the first function, above.
	renderUser(json.owner) // Pass just the nested object `.owner`.
})


// Fetch data for a specific Are.na user. Log the response to inspect the returned object. Then pass the user daa directly to render User (no nesting needed) since the API returns the user data directly at the top level, not nested inside another object.

fetchJson(`https://api.are.na/v3/users/${myUsername}/`, (json) => {
	console.log(json) // See what we get back.

	renderUser(json) // Pass this to the same function, no nesting.
})


// Fetch all blocks from the channel (up to 100),it is sorted by position. Then logs the response to inspect the structure. Then it loops through the returned data array, and for each block, it passes its data to the renderBlock function. The renderBlock function decides how to display each block type based on its properties.

fetchJson(`https://api.are.na/v3/channels/${channelSlug}/contents?per=100&sort=position_desc`, (json) => {
	console.log(json) // See what we get back.

	// Loop through the nested `.data` array (list).
	json.data.forEach((blockData) => {
		// console.log(blockData) // The data for a single block.

		renderBlock(blockData) // Pass the single block’s data to the render function.
	})



	// selects all <li> elements inside #channel-blocks. Go throuh each block one by one. Index is its postition in the list (0, 1, 2, 3...).
	// calculate base z-index. First block gets the highest z (blocks.lenght - 0), and last block gets the lowest. 
	
	let blocks = document.querySelectorAll('#channel-blocks > li')

	blocks.forEach((block, index) => {
		let baseZ = blocks.length - index

		// This stores the value inside a data attribute on the element.So later, you can restore it.
		block.dataset.baseZ = baseZ
		//This sets a custom CSS variable (--z) on each block.
		block.style.setProperty('--z', baseZ)

	})



	// defining variables. activeClass → the class added when visible. topZ → highest stacking value
	// IntersectionObserver detects when an element enters or leaves the viewport. When a block enters the view, it adds the active class and brings it to the front by setting its z-index higher than all others. When it leaves the view, it removes the active class and resets its z-index to the base value stored earlier. The rootMargin is set to trigger when the block is roughly in the middle of the viewport (35% from top and bottom).


	let activeClass = 'active-block'
	let topZ = blocks.length

	blocks.forEach((block) => {
		let baseZ = block.dataset.baseZ
		let blockObserver = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				block.classList.add(activeClass)
				block.style.setProperty('--z', topZ + 1) // bring to front while in view
			} else {
				block.classList.remove(activeClass)
				block.style.setProperty('--z', baseZ) // back to normal when you scroll away
			}
		}, {
			root: null,
			rootMargin: '-45% 0% -45% 0%',
		})

		blockObserver.observe(block)
	})
})


// Defining The button that opens the modal, human world dialog and media world dialog. When the button is clicked, it checks if the body has the class 'human-world'. If it does, it opens the human world dialog. Otherwise, it opens the media world dialog.


let modalButton = document.querySelector('#info-modal')
let modalDialog = document.querySelector('#dialog-human')
let modalDialogMedia = document.querySelector('#dialog-media')

//  event.preventDefault() is used so the link doesn’t do its default action (going to # and jumping to the page top) we only want to open the popup.
modalButton.addEventListener('click', (event) => {
	event.preventDefault()
	if (document.body.classList.contains('human-world')) {
		modalDialog.showModal()
	} else {
		modalDialogMedia.showModal()
	}
})


//This finds the close button inside the dialog and When clicked → close the modal.

modalDialog.querySelector('button').addEventListener('click', () => {
	modalDialog.close()
})

modalDialogMedia.querySelector('button').addEventListener('click', () => {
	modalDialogMedia.close()
})

//If the user clicks directly on the root HTML element (outside the modal), close both dialogs.
document.addEventListener('click', (event) => {
	if (event.target === document.documentElement) {
		modalDialog.close()
		modalDialogMedia.close()
	}
})



//make audio play and stop
//It Listens for clicks anywhere on the page and check if the click was on an audio play button. If it was, find the corresponding audio element and toggle play/pause. Update the button icon accordingly.


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


// making Real World / Dream World toggle show after the we leave the landing page. It uses an IntersectionObserver to watch the landing section. When the landing is in view, it hides the navigation buttons. When we scroll past it, it shows the buttons. This way, the toggle only appears after we scroll down from the intro section.
// When a header button is clicked, the code checks if it’s Dream or Real. It then updates the body class to switch the design and highlights the selected button.
// const creates a variable that cannot be changed to something else later.
// window.scrollTo(0, 0) means telling the browser to scroll to a specific position on the page. window is basically the browser window. scrollTo is a built-in function that changes where the page is scrolled. The first number is the x position (left to right). The second number is the y position (top to bottom). So (0, 0) means: go to the very top-left corner of the page.


// Select the main sections of the page
// #world is the Human/Media world section
// .header-buttons is the navigation toggle (Human / Media)
// #landing is the intro section at the top of the page
let worldSection = document.querySelector('#world')
let nav = document.querySelector('.header-buttons')
let landing = document.querySelector('#landing')


// Create an IntersectionObserver. This observer watches the landing section. It checks whether the landing section is visible in the viewport
let navObserver = new IntersectionObserver(([entry]) => {

	//if landing section is visible on screen hide the navigation, if its not visible show it. 
	if (entry.isIntersecting) {
		nav.classList.remove('is-visible')
	} else {
		nav.classList.add('is-visible')
	}
})

// Start observing the landing section. The observer will run whenever the landing enters or leaves the screen
navObserver.observe(landing)


document.querySelectorAll('.header-btn').forEach((btn) => {
	btn.addEventListener('click', () => {
		const isDream = btn.dataset.world === 'dream'

		//Add the class human-world if isDream is true.
		document.body.classList.toggle('human-world', isDream)
		// When switching to Human World, stop all Media audio, videos, and embeds
		if (isDream) {
			//This selects every <audio> element and pauses it.
			document.querySelectorAll('.audio-el').forEach((a) => {
				a.pause()

				//Finds the play button linked to that audio and changes the icon back to play.  a.closest('.audio-ui') means: starting from the audio element, look up through its parent elements until you find one with the class .audio-ui. This is the container that wraps both the audio element and its controls. Then, from that container, find the play button with .querySelector('.audio-play'). This way, we can target the correct play button for each audio element, even if there are multiple audio players on the page.
				const playBtn = a.closest('.audio-ui')?.querySelector('.audio-play')
				if (playBtn) playBtn.textContent = '▶'
			})

			document.querySelectorAll('#channel-blocks video').forEach((v) => v.pause())
			
            //select every iframe inside the channel blocks. For each one, save its current src URL in a new data attribute called data-pause-src. Then set the iframe’s src to 'about:blank', which effectively stops any embedded media from playing.
			document.querySelectorAll('#channel-blocks iframe').forEach((iframe) => {
				iframe.dataset.pauseSrc = iframe.src
				iframe.src = 'about:blank'
			})
		} else {
			// Restore embed iframes when switching back to Media. before we had stopped them, now we go through each iframe and set its src back to the value we saved in data-pause-src. This will make the embeds load again and play if they have autoplay enabled.
			document.querySelectorAll('#channel-blocks iframe[data-pause-src]').forEach((iframe) => {
				if (iframe.dataset.pauseSrc) iframe.src = iframe.dataset.pauseSrc
			})
			// Resume native videos (they have autoplay muted loop)
			document.querySelectorAll('#channel-blocks video').forEach((v) => v.play().catch(() => {}))
		}


		//clears the active class from all header buttons, so only one is active at a time. Then it adds the active class to the clicked button based on whether it’s Dream or Real. Finally, it scrolls the world section into view with a smooth animation.
		document.querySelectorAll('.header-btn').forEach((b) => b.classList.remove('active'))
		if (isDream) document.querySelector('.header-btn[data-world="dream"]').classList.add('active')
		else document.querySelector('.header-btn[data-world="real"]').classList.add('active')
		worldSection.scrollIntoView({ behavior: 'smooth' })
	})
})


//The site starts in Media (Real) World by default.
document.body.classList.remove('human-world')
document.querySelector('.header-btn[data-world="real"]')?.classList.add('active')



let blockDialog = document.querySelector('#block-dialog')
let blockDialogImg = document.querySelector('#block-dialog-img')
let blockDialogClose = document.querySelector('#block-dialog-close')

document.querySelector('#channel-blocks').addEventListener('click', (event) => {
	//If we are not in Human World, stop. We only want this image popup to work in Human World.
	if (!document.body.classList.contains('human-world')) return
	let block = event.target.closest('.block--image')
	if (!block) return
	let img = block.querySelector('img')
	if (!img) return
	//Copy the image into the modal
	blockDialogImg.src = img.src
	blockDialogImg.alt = img.alt
	//This opens the <dialog> element with backdrop
	blockDialog.showModal()
})


//When clicking close the modal and clear the image source. 

blockDialogClose.addEventListener('click', () => {
	blockDialog.close()
	blockDialogImg.src = ''
})


//If the user clicks outside (on the root element), close the modal. 
document.addEventListener('click', (event) => {
	if (event.target == document.documentElement) {
		blockDialog.close()
	}
})







