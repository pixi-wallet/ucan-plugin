import * as ucan from "@mkabanau/ucans"
import {getPluginInjectedApi} from "@mkabanau/core"

// console.log(getPluginInjectedApi)
const token = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsInVjdiI6IjAuOS4yIn0.eyJleHAiOm51bGwsImF1ZCI6ImRpZDprZXk6ejZNa2dkODNGb0dxdmh0UTUzc0xLc0pzbzZoM1hlOGFuM2F2YUFuaHVTZzk1SnNtIiwiaXNzIjoiZGlkOmtleTp6RG5hZVZpVG1MYTJXV2FMZ1pFNFZ2SmlrZEZNZzNubktIS2pRQ2I0Y3hLTHJpUmdoIiwibmJmIjoxNjgxOTk0OTMyLCJhdHQiOlt7ImNhbiI6ImRucy8qIiwid2l0aCI6ImRpZDpkbnM6bWFrc2ltMjMxcjA0MDUtMjN0ci00LmxpbmsifSx7ImNhbiI6Imttcy8qIiwid2l0aCI6Imh0dHBzOi8vd2ViZmx1aWQuZGV2L2tleXN0b3JlL2RpZDpkbnM6bWFrc2ltMjMxcjA0MDUtMjN0ci00LmxpbmsifV19.f3X-rb1UmaEA6LtHUpHOQBf08BY57MBAV0LdQxADvtntwzC34yn1rjQj3sTg4xk6vBv6p8DUHf-cfe2Sdf9zxA'

const parts = ucan.parse(token)


// console.log(parts)