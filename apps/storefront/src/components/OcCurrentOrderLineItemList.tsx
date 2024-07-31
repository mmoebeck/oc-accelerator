import { FunctionComponent } from 'react'
import OcLineItemList from './OcLineItemList'
import { LineItem } from 'ordercloud-javascript-sdk'

interface OcCurrentOrderLineItemListProps {
  emptyMessage?: string
  editable?: boolean
  productType?: string
  lineItems?: LineItem[]
}

const OcCurrentOrderLineItemList: FunctionComponent<OcCurrentOrderLineItemListProps> = ({
  emptyMessage,
  editable,
  productType,
  lineItems
}) => {
  let productItems = lineItems
  if (productType != null) {
    productItems = lineItems?.filter(function (p) {
      return p.xp?.Type == productType
    })
  }

  return (
    <OcLineItemList
      emptyMessage={emptyMessage}
      editable={editable}
      lineItems={productItems}
    />
  )
}

export default OcCurrentOrderLineItemList
