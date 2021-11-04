import { useCallback, useEffect, useState } from 'react'
import './App.css'
import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'
import { loadContract } from './utils/load-contract'
import logo from './frogLogo.png'

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    isProviderLoaded: false,
    web3: null,
    contract: null,
  })

  const [account, setAccount] = useState(null)
  const [shouldReload, reload] = useState(false)

  let canConnectToContract
  if (account && web3Api.contract && web3Api.provider.chainId == 0xfa) {
    canConnectToContract = true
  }
  const reloadEffect = useCallback(
    () => reload(!shouldReload),
    [shouldReload]
  )

  const setAccountListener = (provider) => {
    provider.on('accountsChanged', (_) => window.location.reload())
    provider.on('chainChanged', (_) => window.location.reload())
  }

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider()

      if (provider) {
        const contract = await loadContract('Distributor', provider)
        setAccountListener(provider)
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract,
          isProviderLoaded: true,
        })
      } else {
        setWeb3Api((api) => ({ ...api, isProviderLoaded: true }))

        console.error('Please install metamask')
      }
    }

    loadProvider()
  }, [])

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts()
      setAccount(accounts[0])
    }

    web3Api.web3 && getAccount()
  }, [web3Api.web3])

  const claimDividend = useCallback(async () => {
    const { contract } = web3Api
    await contract.methods.claimDividend().send({ from: account })

    reloadEffect()
  }, [web3Api, account, reloadEffect])

  return (
    <>
      <div className='claim-wrapper'>
        <div className='claim '>
          <img src={logo} alt='frog logo' className='logo' />
          {web3Api.isProviderLoaded ? (
            <div className='is-flex is-align-items-center'>
              <span>
                <strong className='mr-2 has-text-white'>
                  Your Connected Account:
                </strong>
              </span>
              {account ? (
                <div>{account}</div>
              ) : !web3Api.provider ? (
                <>
                  <div className='notification is-danger is-size-6 is-rounded'>
                    Wallet is not detected!
                    <a
                      className='ml-4'
                      target='_blank'
                      rel='noreferrer'
                      href='https://docs.metamask.io'
                    >
                      Install metamask
                    </a>
                  </div>
                </>
              ) : (
                <button
                  className='button is-small'
                  onClick={() =>
                    web3Api.provider.request({
                      method: 'eth_requestAccounts',
                    })
                  }
                >
                  Connect Wallet
                </button>
              )}
            </div>
          ) : (
            <span>Looking for Web3...</span>
          )}
          <div className='balance-view is-size-2 my-4'>
            Welcome to Frog's wMEMO Manual Claim
          </div>
          {!canConnectToContract && (
            <i className='is-block'>Please Connect to Fantom Chain</i>
          )}
          <div className='is-flex is-align-items-center'>
            <button
              className='button is-primary is-light mr-2'
              onClick={claimDividend}
              disabled={!canConnectToContract}
            >
              Claim wMEMO
            </button>
            <span>
              <strong className='mr-2 has-text-white'>
                wMEMO address :
              </strong>
              0xDDc0385169797937066bBd8EF409b5B3c0dFEB52
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
