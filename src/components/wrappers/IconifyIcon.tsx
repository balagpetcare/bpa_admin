'use client'
import { Icon, addCollection, type IconProps } from '@iconify/react'
import solarData from '@iconify-json/solar/icons.json'
import bxData from '@iconify-json/bx/icons.json'
import biData from '@iconify-json/bi/icons.json'
import iconamoonData from '@iconify-json/iconamoon/icons.json'

// Pre-load all icon sets used in this admin panel so icons render immediately
// without waiting for the Iconify CDN, preventing the empty-span flash.
addCollection(solarData)
addCollection(bxData)
addCollection(biData)
addCollection(iconamoonData)

const IconifyIcon = (props: IconProps) => {
  return <Icon {...props} />
}

export default IconifyIcon
