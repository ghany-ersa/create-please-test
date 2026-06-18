const { please, AUTH } = require('../app')
const { PAGE, ACCOUNT } = require('../data/main')

describe('Login - practicetestautomation.com', () => {
    beforeEach(async () => {
        await please.goTo(PAGE.login)
    })

    it('menampilkan halaman login', async () => {})

    it('login gagal - username salah', async () => {
        await AUTH.login(ACCOUNT.wrongUsername)
        please.equal(await please.see('pesan error', '//div[@id="error"]'), 'Your username is invalid!')
    })

    it('login gagal - password salah', async () => {
        await AUTH.login(ACCOUNT.wrongPassword)
        please.equal(await please.see('pesan error', '//div[@id="error"]'), 'Your password is invalid!')
    })

    it('login gagal - form kosong', async () => {
        await AUTH.login(ACCOUNT.empty)
        please.equal(await please.see('pesan error', '//div[@id="error"]'), 'Your username is invalid!')
    })

    it('login berhasil', async () => {
        await AUTH.login(ACCOUNT.valid)
        await please.checkWhere(PAGE.dashboard)
        please.equal(await please.see('teks sukses', '//h1'), 'Logged In Successfully')
        await AUTH.logout()
    })
})
