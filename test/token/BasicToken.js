import assertRevert from '../helpers/assertRevert'
import assertBalance from '../helpers/assertBalance'

function basicTokenTests([owner, oneHundred, anotherAccount], transfersToZeroBecomeBurns) {
    describe('--BasicToken Tests--', function () {
        const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

        describe('total supply', function () {
            it('returns the total amount of tokens', async function () {
                const totalSupply = await this.token.totalSupply()

                assert.equal(totalSupply, 100)
            })
        })

        describe('balanceOf', function () {
            describe('when the requested account has no tokens', function () {
                it('returns zero', async function () {
                    await assertBalance(this.token, owner, 0)
                })
            })

            describe('when the requested account has some tokens', function () {
                it('returns the total amount of tokens', async function () {
                    await assertBalance(this.token, oneHundred, 100)
                })
            })
        })

        describe('transfer', function () {
            describe('when the anotherAccount is not the zero address', function () {
                const to = anotherAccount

                describe('when the sender does not have enough balance', function () {
                    const amount = 101

                    it('reverts', async function () {
                        await assertRevert(this.token.transfer(to, amount, { from: oneHundred }))
                    })
                })

                describe('when the sender has enough balance', function () {
                    const amount = 100

                    it('transfers the requested amount', async function () {
                        await this.token.transfer(to, amount, { from: oneHundred })
                        await assertBalance(this.token, oneHundred, 0)
                        await assertBalance(this.token, to, amount)
                    })

                    it('emits a transfer event', async function () {
                        const { logs } = await this.token.transfer(to, amount, { from: oneHundred })

                        assert.equal(logs.length, 1)
                        assert.equal(logs[0].event, 'Transfer')
                        assert.equal(logs[0].args.from, oneHundred)
                        assert.equal(logs[0].args.to, to)
                        assert(logs[0].args.value.eq(amount))
                    })
                })
            })

            // This test is skipped for contracts that inherit from WithdrawalToken
            // because they treat such transfers as burns instead
            if (!transfersToZeroBecomeBurns) {
                describe('when the anotherAccount is the zero address', function () {
                    const to = ZERO_ADDRESS

                    it('reverts', async function () {
                        await assertRevert(this.token.transfer(to, 100, { from: oneHundred }))
                    })
                })
            }
        })
    })
}

export default basicTokenTests