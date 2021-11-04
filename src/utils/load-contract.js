import Web3 from 'web3'

export const loadContract = async (name, provider) => {
  let web3 = new Web3(provider)

  const res = await fetch(`/contracts/ftm/${name}.json`)
  const Artifact = await res.json()

  let deployedContract = null
  try {
    deployedContract = new web3.eth.Contract(
      Artifact,
      '284358a43077bAF5fc1f8FA9F7c0e8aff23093F7'
    )
  } catch {
    console.error('You are connected to the wrong network')
  }

  return deployedContract
}
