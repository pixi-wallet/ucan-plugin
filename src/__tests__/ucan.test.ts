
import { Ucan } from "../index"

import {EdKeypair ,StoreI, verify, validate, Store, equalCanDelegate, parse, EcdsaKeypair } from "@mkabanau/ucans"
// import { ed25519Plugin } from "@ucans/default-plugins/ed25519/plugin"

import { verifyMessage, hashMessage} from 'ethers/lib/utils'
import { Wallet } from "ethers"
import * as uint8arrays from "uint8arrays" // @IMPORT

import {didToPublicKey, publicKeyToDid} from '../functions/crypto'

import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes, toUtf8String} from "@ethersproject/strings";
import { Bytes, concat } from "@ethersproject/bytes";

function getTimestampInSeconds () {
    return Math.floor(Date.now() / 1000)
  }
const toSign = {
    audience: "did:key:zDnaegJhvyDSdYubg2ZobTDiEwHsuLMvwSwp92o6e98Uov4fH", // recipient DID
    capabilities: [ // permissions for ucan
        {
            with: { scheme: "wnfs", hierPart: "//boris.fission.name/public/photos/" },
            can: { namespace: "wnfs", segments: ["OVERWRITE"] }
        },
        {
            with: { scheme: "wnfs", hierPart: "//boris.fission.name/private/6m-mLXYuXi5m6vxgRTfJ7k_xzbmpk7LeD3qYt0TM1M0" },
            can: { namespace: "wnfs", segments: ["APPEND"] }
        },
        {
            with: { scheme: "mailto", hierPart: "boris@fission.codes" },
            can: { namespace: "msg", segments: ["SEND"] },
            nb: {token:"header.payload.signature"}
        }
    ],
    // proofs: ["test.test.test"],
    facts: [{"wtf":{"hello":"friend"}}],
    notBefore: getTimestampInSeconds(),
    expiration: getTimestampInSeconds() + 3600

}

describe("explore ucans", () => {
    const ucan = new Ucan()
    test("create ucan capability with keypair", async () => {
        const keypair = await EdKeypair.create({ exportable: true })
        const token = await ucan.capabilityWithExternalKeyPair(keypair, toSign)
        // // console.log(token)
        expect(token).not.toBeFalsy()
    })

    test("create ucan signed by p256", async ()=>{
        const keypair = await EcdsaKeypair.create({ exportable: true })
        
        const token = await ucan.capabilityWithExternalSignFunc(keypair, toSign)
        
        // console.log("p256 token",token)
        expect(token).not.toBeFalsy()
        let p = parse(token)
    })
    test("create ucan capability with sign func", async () => {
        const keypair = await EdKeypair.create({ exportable: true })
        const token = await ucan.capabilityWithExternalSignFunc(keypair, toSign)
        
        // console.log("token",token)
        expect(token).not.toBeFalsy()
        let p = parse(token)
        // console.log(p)
        // console.log(JSON.stringify(p.payload.att))
    })

    // test("create ucan capability with wallet sign", async () => {
    //     const signature = await signMessage({
    //         message: 'gm wagmi frens',
    //     })
    //     expect(signature).not.toBeFalsy()
    //     // console.log(signature)
    // })
})


class Wallet2 {
    private keystorage: Map<string, string>
    private webkms: any
    private ucan: any
    private store: StoreI
    constructor() {
        this.keystorage = new Map<string, string>()
        this.ucan = new Ucan()
    }
    static async Init(): Promise<Wallet2> {
        const wallet = new Wallet2()
        await wallet.initUcanStorate()
        return wallet
    }
    async initUcanStorate() {
        this.store = await Store.empty(equalCanDelegate)
    }
    async key(): Promise<string> {
        const keypair = await EdKeypair.create({ exportable: true })

        this.keystorage.set(keypair.did(), await keypair.export())
        return keypair.did()

    }
    async createucan(iss: string, payload: any): Promise<string> {
        const secret = this.keystorage.get(iss)
        if (!secret) {
            throw Error(`secret key is not found for ${iss}`)
        }
        const keypair = EdKeypair.fromSecretKey(secret)
        const token = await this.ucan.capabilityWithExternalKeyPair(keypair, payload)
        //this.store.add(ucans.parse(token))
        return token
    }

    async verify(token: string, opts?: any): Promise<any> {
        return await verify(token, opts)
    }

    async validate(token: string): Promise<any> {
        return await validate(token)
    }

}

describe("pixi flow", () => {


    test("creat key", async () => {
        const wallet = await Wallet2.Init()
        const issuerDID = await wallet.key()
        const token = await wallet.createucan(issuerDID, toSign)
        expect(token).not.toBeFalsy()
        const result = await wallet.verify(token, {
            audience: toSign.audience, requiredCapabilities: [
                {
                    capability: {
                        with: { scheme: "mailto", hierPart: "boris@fission.codes" },
                        can: { namespace: "msg", segments: ["SEND"] }
                    },
                    rootIssuer: issuerDID,
                }
            ]
        }
        )
        expect(result.ok).toEqual(true)
        const result2 = await wallet.validate(token)
        // console.log(result2)
        expect(result2).not.toBeUndefined()
    })

})

describe("metamask verify", ()=>{

    const signedUcan = "eyJhbGciOiJzZWNwMjU2azEiLCJ0eXAiOiJKV1QiLCJ1Y3YiOiIwLjguMSJ9.eyJhdWQiOiJkaWQ6a2V5Ono2TWtqeW90ZVlKNkcyd0hhajRuOGRMTVU5U0ExUW5mN0VZVUFGbjF3NGM0RnFucSIsImF0dCI6W3sid2l0aCI6ImRuczpleGFtcGxlLmxpbmsiLCJjYW4iOiJkbnMvKiJ9LHsid2l0aCI6ImRuczpleGFtcGxlLmxpbmsiLCJjYW4iOiJrbXMvKiJ9XSwiZXhwIjoxNjgxMzEwMTU2LCJpc3MiOiJkaWQ6a2V5Ono2RHRiS0ZEN0pwU0xvZkI4c2hVNFJVblByc1Z3R3RBR3g4Y1U5ekNZMXl6SFRvdSIsInByZiI6W119.YWU1OGQ4NWQ2NjE4M2I0MWZjZTc1NjRjODAyODk0NmViZTU2NDc2ZjRlYTgzYTI2NTBjNTBmNzUxMWVlZDc3NzA1NzI1OGQ2YjU4MmRjMmI0ZjYzYjNhZGYxNGNiYjA0MTRiMzBiZWE2YjBmNTlmYzAzZDg3ODk0MzY2NjRiYjExYg"

    const signerAddress = "0xd4d5171211EDA08dE5Da552378f85f2F7572af2c"
    // test("verify", ()=>{
    //     let parts = signedUcan.split(".")
    //     let parsedUcan = ucans.parse(signedUcan)
    //     let sig = uint8arrays.fromString(parts[2], "base64url")
    //     let decoder = new TextDecoder()
    //     let sigStr = decoder.decode(sig)
    //     // console.log(sigStr)
    //     const address = verifyMessage(`${parts[0]}.${parts[1]}`, sig)
    //     // console.log(address)
    //     expect(parsedUcan.payload.iss).toBe(signerAddress)
    // })
    test("hardcoded value to verify", ()=>{
        let tokenucan = 'eyJhbGciOiJzZWNwMjU2azEiLCJ0eXAiOiJKV1QiLCJ1Y3YiOiIwLjguMSJ9.eyJhdWQiOiJkaWQ6a2V5Ono2TWt2clZzUXFzUjlESG5zTXJEbkJGSGtqS2V4THl6V24zbjJRWUFZb2dqTkNkYiIsImF0dCI6W3sid2l0aCI6ImRuczpleGFtcGxlLmxpbmsiLCJjYW4iOiJkbnMvKiJ9LHsid2l0aCI6ImRuczpleGFtcGxlLmxpbmsiLCJjYW4iOiJrbXMvKiJ9XSwiZXhwIjoxNjgxMzIwMDAzLCJpc3MiOiJkaWQ6a2V5Ono2RHRQOHYxUnQ5cEpMNmJWSjY2cWNHOTluRFhCYW1jQ2pCTVMyNUpGMll0ZFJZMiIsInByZiI6W119.MHhkOGQ0NjhjNjY1ZDZjYjI0YzBkZWJiNTZkMDNhNWE0ZGJiZTczOTc4NDY1ZjU4YjYxMzUwYjE1ZGRkYzg0Zjk3MGMzMDZiZGRlOGFjYjE4MjFiMzRkYmM4ZWEzM2UzYzRmZjIzYTE4NTY3MDUwZWJhYjhjNDk2OWNlNmIyMDA5OTFi'
        let parsedUcan = parse(tokenucan)
        let msg = 'eyJhbGciOiJzZWNwMjU2azEiLCJ0eXAiOiJKV1QiLCJ1Y3YiOiIwLjguMSJ9.eyJhdWQiOiJkaWQ6a2V5Ono2TWt0WmlpTFJlUGI0ZkRKVWExdHNFYVlhRUpLRUZ0YzgxUmdGTUphTnVRUFpqUCIsImF0dCI6W3sid2l0aCI6ImRuczpleGFtcGxlLmxpbmsiLCJjYW4iOiJkbnMvKiJ9LHsid2l0aCI6ImRuczpleGFtcGxlLmxpbmsiLCJjYW4iOiJrbXMvKiJ9XSwiZXhwIjoxNjgxMzI2MjI4LCJpc3MiOiJkaWQ6a2V5OnoySjdIOFc1VzE0S1FCcFBxOVZtbzNDM2pVRldnOFV4M0FnaGhCNlRjU1NuV1RoVWZ0eTZjRjR3SEpEcFNuIiwicHJmIjpbXX0'
        let sig = '0xdae769aa05b6358f0e0ec90023ab27a2bde44386d12d3859f06c1e0c047ee8870a8cab2f065dc8fc0c012c79f0e4a7cd45824fa45842f7217c4420e0e962f1731b'
        const address = verifyMessage(msg, sig)
        expect(address).toBe(signerAddress)
        // console.log(address)
        // console.log(parsedUcan.payload.iss)
        let restoredkeyBytes = didToPublicKey(parsedUcan.payload.iss)
        let restoredkey = uint8arrays.toString(restoredkeyBytes)
        // expect(restoredkey).toBe(signerAddress)
    })

    test("verify signature", ()=>{
        let token = 'eyJhbGciOiJzZWNwMjU2azEiLCJ0eXAiOiJKV1QiLCJ1Y3YiOiIwLjguMSJ9.eyJhdWQiOiJkaWQ6a2V5Ono2TWtnZDgzRm9HcXZodFE1M3NMS3NKc282aDNYZThhbjNhdmFBbmh1U2c5NUpzbSIsImF0dCI6W3sid2l0aCI6ImRuczpleGFtcGxlLmxpbmsiLCJjYW4iOiJkbnMvKiJ9LHsid2l0aCI6ImRuczpleGFtcGxlLmxpbmsiLCJjYW4iOiJrbXMvKiJ9XSwiZXhwIjoxNjgyNjA5NTkyLCJpc3MiOiJkaWQ6a2V5Ono3cjhvb2hmdHNlZE1zOTF4N0FVY1JkdU1zdlk4WXd6ZmE3R2czZlJnWGd4Uk1TRWRkM2hmVWN4empiVkc2b2cyaE1CZVZZMXRyRnRGRlRVNEhEMUhGdGo2WmZpQyIsInByZiI6WyJkYXNmYXNmIl19.MHgwNjU5NDk1YjZhYjExMDhlZGQ5YzJkMmQ3MWM5ZTYwNDI0OTFjOWE3ZDBkOTE1YmIzZDM2NWNkZjAxMWE4M2Q5MmYxNzhmMWViZTk4YzU1MzcyZmI2YWVhM2E5YTVlMGUyOWE2NTFkYmQ0MzllZGU0MmNlYWY0ZjY4YjNmNDVjYjFi'
        let parts = token.split(".")
        let sig1 =  '0x0659495b6ab1108edd9c2d2d71c9e6042491c9a7d0d915bb3d365cdf011a83d92f178f1ebe98c55372fb6aea3a9a5e0e29a651dbd439ede42ceaf4f68b3f45cb1b'
        let sig2 = uint8arrays.fromString(parts[2], "base64url")
        // console.log("sig2", sig2)
        let sig3 = uint8arrays.toString(sig2)
        // console.log(sig3)
    
        // console.log("====")
        // console.log(sig1)
        // console.log(sig3)
        // console.log("====")
        // expect(sig1).toBe()
        let msg = `${parts[0]}.${parts[1]}`
        const address = verifyMessage(msg, sig3)
        expect(address).toBe(signerAddress)
        const data = uint8arrays.fromString(`${parts[0]}.${parts[1]}`, "utf8")
        const address2 = verifyMessage(data, sig3)
        expect(address2).toBe(signerAddress)
    })

    test("recover key", ()=>{
        var pk = uint8arrays.fromString(signerAddress)
        let didkey = publicKeyToDid(pk)
        // console.log("didkey", didkey)
    })

    test('parse invalid token', ()=>{
       let invalidToken = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsInVjdiI6IjAuOS4yIn0.eyJleHAiOm51bGwsImF1ZCI6ImRpZDprZXk6ejZNa2dkODNGb0dxdmh0UTUzc0xLc0pzbzZoM1hlOGFuM2F2YUFuaHVTZzk1SnNtIiwiaXNzIjoiZGlkOmtleTp6RG5hZVZpVG1MYTJXV2FMZ1pFNFZ2SmlrZEZNZzNubktIS2pRQ2I0Y3hLTHJpUmdoIiwibmJmIjoxNjgxOTk0OTMyLCJhdHQiOlt7ImNhbiI6ImRucy8qIiwid2l0aCI6ImRpZDpkbnM6bWFrc2ltMjMxcjA0MDUtMjN0ci00LmxpbmsifSx7ImNhbiI6Imttcy8qIiwid2l0aCI6Imh0dHBzOi8vd2ViZmx1aWQuZGV2L2tleXN0b3JlL2RpZDpkbnM6bWFrc2ltMjMxcjA0MDUtMjN0ci00LmxpbmsifV19.f3X-rb1UmaEA6LtHUpHOQBf08BY57MBAV0LdQxADvtntwzC34yn1rjQj3sTg4xk6vBv6p8DUHf-cfe2Sdf9zxA'
       let parts = parse(invalidToken)
       // console.log(parts)
    })

    test("test signer", async ()=>{
        let wallet = Wallet.createRandom()
        let msg = "testme1"
        let hmsg = hashMessage(msg)
        // console.log("calculated hash", hmsg)

        let sig = await wallet.signMessage(msg)
        // console.log("sig", sig)
        let addr2 = verifyMessage(msg, sig)
        let addr1 = await wallet.getAddress()
        // console.log("address", addr1)
        expect(addr1).toBe(addr2)

        let simplehash = keccak256(toUtf8Bytes(msg))
        // console.log("keccak256", simplehash)

        let message = toUtf8Bytes(msg)
        const messagePrefix = "\x19Ethereum Signed Message:\n";
        let toSignAgain = concat([
            toUtf8Bytes(messagePrefix),
            toUtf8Bytes(String(message.length)),
            message
        ])
        // console.log("whatwesign",toSignAgain)
        const recover = toUtf8String(toSignAgain)
        // console.log(recover)
    })
})