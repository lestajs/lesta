import { uid } from '../../../../packages/utils'

describe('Generate UID function', () => {
  it('Generates a UUID v4', () => {
    const _uid = uid()
    const regex = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i
    expect(_uid).to.match(regex)
  })
})