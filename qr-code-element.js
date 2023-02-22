import { LitElement, css, html, svg } from 'lit'

import {
	QrCode,
	QrSegment,
	Ecc,
	countUnicodeChars,
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
				--size: var(--size, 11rem);
				--icon-size: var(--icon-size, calc(var(--size) * 0.15));

				display: block;
				position: relative;
			}

			:host > svg {
				inline-size: var(--size);
				block-size: var(--size);
			}

			::slotted(svg) {
				inline-size: var(--icon-size);
				block-size: var(--icon-size);

				position: absolute;
				top: calc((var(--size) - var(--icon-size)) / 2);
				left: calc((var(--size) - var(--icon-size)) / 2);

				z-index: 10;

				/* border-radius: 50%; */
				/* background-color: whitesmoke; */
			}

			canvas {
				inline-size: var(--size);
				block-size: var(--size);
			}

			svg {
				inline-size: var(--size);
				block-size: var(--size);
			}
		`
	}

	static get properties () {
		return {
			text: String,
			graphicElement: {
				type: String,
				attribute: 'graphic-element',
				converter: {
					fromAttribute: (value, type) => {

						switch (value.toLowerCase()) {
							case 'svg':
								return 'svg'
							case 'canvas':
								return 'canvas'
							default:
								return 'svg'
						}

					}
				}
			},
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

		this.graphicElement = 'svg'
	}

	willUpdate (changedProperties) {

		// listen for change in the attributes to compute new qr
		if (changedProperties.has('text') ||
			changedProperties.has('graphicElement') ||
			changedProperties.has('maskPattern') ||
			changedProperties.has('errorCorrection') ||
			changedProperties.has('bkColor') ||
			changedProperties.has('tileColor') ||
			changedProperties.has('scale') ||
			changedProperties.has('border')
			) {

			const qr = QrCode.encodeText(this.text, this.errorCorrection)

			// populate the svg element
			if (this.graphicElement === 'svg') {

				this.svg = toSvgString(
					qr,
					this.border,
					this.bkColor,
					this.tileColor
				)

			}

		}

	}

	// Show the QR Code symbol's statistics as a object
	getStatistics () {
		const qr = QrCode.encodeText(this.text, this.errorCorrection)
		const segs = QrSegment.makeSegments(this.text)

		const statistics = {
			qrVersion: qr.version,
			maskPattern: qr.mask,
			characterCount: countUnicodeChars(this.text),
			errorCorrection: this.errorCorrection.ordinal,
			dataBits: Number(QrSegment.getTotalBits(segs, qr.version))

		}

		return statistics
	}

	render () {

		if (this.graphicElement === 'canvas') {

			const qr = QrCode.encodeText(this.text, this.errorCorrection)

			let cvs = this.renderRoot.querySelector('canvas')
			if (!cvs) {
				cvs = document.createElement('canvas')
				this.renderRoot.appendChild(cvs)
			}
			
			drawOnCanvas(
				qr,
				this.scale,
				this.border,
				this.bkColor,
				this.tileColor,
				cvs
			)

		}

		return html`
			${this.svg}

			<slot name="icon"></slot>
		`
	}
}

customElements.define('qr-code-element', QrCodeElement)
