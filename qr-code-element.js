import { LitElement, css, html, svg } from 'lit'

import {
	QrCode,
	Ecc,
	drawOnCanvas,
	toSvgString
} from './qr-code.js'

/**
 * Lit WebCompoment use as a wrapper for Qr Code Projecy Nayuki Library
 * 
 * https://www.nayuki.io/page/qr-code-generator-library
 * 
 * Project Nayuki Library v1.8.0 
 * 
 */
class QrCodeElement extends LitElement {

	static get styles () {
		return css`
			:host {
				display: block;
			}

			canvas {
				/* stuff for canvas */
			}

			svg {
				/* stuff for SVG */
				--size: 11rem;
				inline-size: var(--size);
				block-size: var(--size);
			}
		`
	}

	static get properties () {
		return {
			text: String,
			scale: Number,
			border: Number,
			maskPattern: {
				type: Number,
				attribute: 'mask-pattern',
				converter: {
					fromAttribute: (value, type) => {
						if (value >= -1 && value < 8) {
							return value
						} else {
							return -1
						}
					}
				}
			},
			bkColor: {
				type: String,
				attribute: 'bk-color',
				converter: {
					fromAttribute: (value, type) => {
						const s = new Option().style
						s.color = value
						return s.color ? s.color : '#fff'
					}
				}
			},
			tileColor: {
				type: String,
				attribute: 'tile-color',
				converter: {
					fromAttribute: (value, type) => {
						const s = new Option().style
						s.color = value
						return s.color ? s.color : '#000'
					}
				}
			},
			errorCorrection: {
				type: String,
				attribute: 'error-correction',
				converter: {
					fromAttribute: (value, type) => {

						switch (value.toLowerCase()) {
							case 'low':
								return Ecc.LOW
							case 'medium':
								return Ecc.MEDIUM
							case 'quartile':
								return Ecc.QUARTILE
							case 'high':
								return Ecc.HIGH
							default:
								return Ecc.MEDIUM
						}

					}
				}
			}
		}
	}

	constructor () {
		super()

		// default Qr settings
		this.scale = 10
		this.border =1
		this.maskPatter = -1
		this.errorCorrection = Ecc.MEDIUM
		this.bkColor = '#fff'
		this.tileColor = '#000'

		this.svg = ''
	}

	willUpdate (changedProperties) {

		// listen for change in the attributes to compute new qr
		if (changedProperties.has('text') ||
			changedProperties.has('maskPattern') ||
			changedProperties.has('errorCorrection') ||
			changedProperties.has('bkColor') ||
			changedProperties.has('tileColor') ||
			changedProperties.has('scale') ||
			changedProperties.has('border')
			) {

			const cvs = this.renderRoot.querySelector('#cvs')

			if (!cvs) return

			const qr = QrCode.encodeText(this.text, this.errorCorrection)

			// draw on canvas the qr code generated
			drawOnCanvas(
				qr,
				this.scale,
				this.border,
				this.bkColor,
				this.tileColor,
				cvs)

			this.svg = toSvgString(
				qr,
				this.border,
				this.bkColor,
				this.tileColor
			)

		}

	} 

	firstUpdated () {
		this.text = '@CICCIOSGAMINO 🧑‍💻'
	}
	
	render () {

		return html`
			<canvas id="cvs"></canvas>

			${svg`${this.svg}`}
		`
	}
}

customElements.define('qr-code-element', QrCodeElement)
