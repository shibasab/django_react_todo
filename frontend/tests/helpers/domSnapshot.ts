type RootNode = Element | DocumentFragment

const IGNORED_TAG_NAMES = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT'])

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim()

const summarizeNodeText = (node: Node): string => normalizeWhitespace(node.textContent ?? '')

const isIgnoredTextNode = (textNode: Text): boolean => {
  const parent = textNode.parentElement
  if (parent == null) {
    return true
  }
  return IGNORED_TAG_NAMES.has(parent.tagName)
}

/**
 * DOMツリーから表示文言を抽出し、空白区切りの単一文字列として返します。
 */
export const summarizeText = (root: RootNode): string => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const texts: string[] = []

  for (let current = walker.nextNode(); current != null; current = walker.nextNode()) {
    if (!(current instanceof Text)) {
      continue
    }
    if (isIgnoredTextNode(current)) {
      continue
    }
    const normalized = normalizeWhitespace(current.nodeValue ?? '')
    if (normalized !== '') {
      texts.push(normalized)
    }
  }

  return texts.join(' ')
}

type InputSummary = Readonly<{
  kind: 'input'
  name: string
  type: string
  value: string
  placeholder: string
  disabled: boolean
  readOnly: boolean
  required: boolean
  ariaLabel: string
}>

type InputChoiceSummary = Readonly<{
  kind: 'inputChoice'
  name: string
  type: 'checkbox' | 'radio'
  checked: boolean
  disabled: boolean
  value: string
  required: boolean
  labelText: string
}>

type SelectOptionSummary = Readonly<{
  value: string
  text: string
  selected: boolean
}>

type SelectSummary = Readonly<{
  kind: 'select'
  name: string
  value: string
  disabled: boolean
  required: boolean
  options: readonly SelectOptionSummary[]
}>

type TextareaSummary = Readonly<{
  kind: 'textarea'
  name: string
  value: string
  placeholder: string
  disabled: boolean
  readOnly: boolean
  required: boolean
}>

type ButtonSummary = Readonly<{
  kind: 'button'
  textContent: string
  type: 'submit' | 'button' | 'reset'
  disabled: boolean
  ariaLabel: string
}>

export type FormElementSummary = InputSummary | InputChoiceSummary | SelectSummary | TextareaSummary | ButtonSummary

type LinkSummary = Readonly<{
  href: string
  textContent: string
  target: string
  ariaLabel: string
}>

type ImageSummary = Readonly<{
  src: string
  alt: string
  width: number
  height: number
}>

type TableSummary = Readonly<{
  headers: readonly string[]
  rows: readonly (readonly string[])[]
}>

export type MediaAndStructureSummary = Readonly<{
  links: readonly LinkSummary[]
  images: readonly ImageSummary[]
  tables: readonly TableSummary[]
}>

const summarizeAssociatedLabelText = (input: HTMLInputElement): string => {
  if (input.labels != null && input.labels.length > 0) {
    return summarizeNodeText(input.labels[0])
  }

  if (input.id !== '') {
    const byFor = document.querySelector(`label[for="${CSS.escape(input.id)}"]`)
    if (byFor != null) {
      return summarizeNodeText(byFor)
    }
  }

  const wrapped = input.closest('label')
  if (wrapped != null) {
    return summarizeNodeText(wrapped)
  }

  return ''
}

const summarizeInput = (input: HTMLInputElement): FormElementSummary => {
  if (input.type === 'checkbox' || input.type === 'radio') {
    return {
      kind: 'inputChoice',
      name: input.name,
      type: input.type,
      checked: input.checked,
      disabled: input.disabled,
      value: input.value,
      required: input.required,
      labelText: summarizeAssociatedLabelText(input),
    }
  }

  return {
    kind: 'input',
    name: input.name,
    type: input.type,
    value: input.value,
    placeholder: input.placeholder,
    disabled: input.disabled,
    readOnly: input.readOnly,
    required: input.required,
    ariaLabel: input.getAttribute('aria-label') ?? '',
  }
}

const summarizeSelect = (select: HTMLSelectElement): SelectSummary => {
  return {
    kind: 'select',
    name: select.name,
    value: select.value,
    disabled: select.disabled,
    required: select.required,
    options: Array.from(select.options, (option) => ({
      value: option.value,
      text: summarizeNodeText(option),
      selected: option.selected,
    })),
  }
}

const summarizeTextarea = (textarea: HTMLTextAreaElement): TextareaSummary => ({
  kind: 'textarea',
  name: textarea.name,
  value: textarea.value,
  placeholder: textarea.placeholder,
  disabled: textarea.disabled,
  readOnly: textarea.readOnly,
  required: textarea.required,
})

const summarizeButtonType = (button: HTMLButtonElement): 'submit' | 'button' | 'reset' => {
  if (button.type === 'button' || button.type === 'reset' || button.type === 'submit') {
    return button.type
  }
  return 'submit'
}

const summarizeButton = (button: HTMLButtonElement): ButtonSummary => ({
  kind: 'button',
  textContent: summarizeNodeText(button),
  type: summarizeButtonType(button),
  disabled: button.disabled,
  ariaLabel: button.getAttribute('aria-label') ?? '',
})

/**
 * DOM配下のフォーム要素状態を要約して返します。
 */
export const summarizeFormControls = (root: ParentNode): readonly FormElementSummary[] => {
  const controls = root.querySelectorAll('input, select, textarea, button')

  return Array.from(controls, (control): FormElementSummary => {
    if (control instanceof HTMLInputElement) {
      return summarizeInput(control)
    }
    if (control instanceof HTMLSelectElement) {
      return summarizeSelect(control)
    }
    if (control instanceof HTMLTextAreaElement) {
      return summarizeTextarea(control)
    }
    if (control instanceof HTMLButtonElement) {
      return summarizeButton(control)
    }
    throw new Error(`Unsupported form control: ${control.tagName}`)
  })
}

const summarizeLink = (anchor: HTMLAnchorElement): LinkSummary => ({
  href: anchor.getAttribute('href') ?? '',
  textContent: summarizeNodeText(anchor),
  target: anchor.getAttribute('target') ?? '',
  ariaLabel: anchor.getAttribute('aria-label') ?? '',
})

const summarizeImage = (image: HTMLImageElement): ImageSummary => ({
  src: image.getAttribute('src') ?? '',
  alt: image.getAttribute('alt') ?? '',
  width: image.width,
  height: image.height,
})

const summarizeTable = (table: HTMLTableElement): TableSummary => {
  const headers = Array.from(table.querySelectorAll('thead th'), (th) => summarizeNodeText(th))
  const rows = Array.from(table.querySelectorAll('tbody tr'), (tr) =>
    Array.from(tr.querySelectorAll('td'), (td) => summarizeNodeText(td)),
  )

  return {
    headers,
    rows,
  }
}

/**
 * DOM配下のリンク・画像・表を要約して返します。
 */
export const summarizeMediaAndStructure = (root: ParentNode): MediaAndStructureSummary => {
  const links = Array.from(root.querySelectorAll('a'), summarizeLink)
  const images = Array.from(root.querySelectorAll('img'), summarizeImage)
  const tables = Array.from(root.querySelectorAll('table'), summarizeTable)

  return {
    links,
    images,
    tables,
  }
}
