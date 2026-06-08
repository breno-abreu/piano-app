export function isMidiSupported() {
  return typeof navigator !== 'undefined' && Boolean(navigator.requestMIDIAccess)
}

export async function requestMidiAccess() {
  if (!isMidiSupported()) {
    return null
  }

  return navigator.requestMIDIAccess({ sysex: false })
}

export function getMidiInputCount(access) {
  if (!access?.inputs) return 0

  return access.inputs.size
}

function dispatchVoiceMessage(command, data1, data2, handlers) {
  const { onNoteOn, onNoteOff, onControlChange } = handlers

  if (command === 0xb0) {
    onControlChange?.(data1, data2)
    return
  }

  if (command === 0x90 && data2 > 0) {
    onNoteOn?.(data1, data2)
    return
  }

  if (command === 0x80 || (command === 0x90 && data2 === 0)) {
    onNoteOff?.(data1)
  }
}

function parseMidiEventData(data, runningStatus) {
  const messages = []
  let offset = 0
  let status = runningStatus

  while (offset < data.length) {
    const byte = data[offset]

    if (byte >= 0xf8) {
      offset++
      continue
    }

    if (byte === 0xf0 || byte === 0xf7) {
      break
    }

    if (byte >= 0xf0) {
      offset++
      if (byte === 0xf1 || byte === 0xf3) {
        if (offset < data.length) offset++
      } else if (byte === 0xf2) {
        offset = Math.min(offset + 2, data.length)
      }
      continue
    }

    if (byte >= 0x80) {
      status = byte
      offset++
    }

    if (!status) {
      offset++
      continue
    }

    const command = status & 0xf0

    if (command === 0xc0 || command === 0xd0) {
      if (offset >= data.length) break
      offset++
      continue
    }

    if (command === 0xe0) {
      if (offset + 1 >= data.length) break
      offset += 2
      continue
    }

    if (offset + 1 >= data.length) break

    messages.push({
      command,
      data1: data[offset],
      data2: data[offset + 1],
    })
    offset += 2
  }

  return { messages, runningStatus: status }
}

export function bindMidiInputs(
  access,
  { onNoteOn, onNoteOff, onControlChange, onMidiMessage, onInputsChange },
) {
  const boundInputs = new Map()
  const runningStatusByInput = new Map()
  const handlers = { onNoteOn, onNoteOff, onControlChange }

  const handleMessage = (event) => {
    const data = event.data
    if (!data?.length) return

    onMidiMessage?.(data)

    const inputId = event.target?.id ?? 'default'
    const { messages, runningStatus } = parseMidiEventData(
      data,
      runningStatusByInput.get(inputId) ?? null,
    )

    if (runningStatus) {
      runningStatusByInput.set(inputId, runningStatus)
    }

    for (const message of messages) {
      dispatchVoiceMessage(message.command, message.data1, message.data2, handlers)
    }
  }

  const attachInput = (input) => {
    if (!input) return

    input.onmidimessage = handleMessage
    boundInputs.set(input.id, input)
  }

  const notifyInputsChange = () => {
    onInputsChange?.(getMidiInputCount(access))
  }

  const attachAllInputs = () => {
    for (const input of access.inputs.values()) {
      attachInput(input)
    }

    notifyInputsChange()
  }

  attachAllInputs()
  access.onstatechange = attachAllInputs

  return {
    detach() {
      access.onstatechange = null

      for (const input of boundInputs.values()) {
        input.onmidimessage = null
      }

      boundInputs.clear()
      runningStatusByInput.clear()
    },
  }
}
