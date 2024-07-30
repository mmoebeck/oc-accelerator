import { FunctionComponent } from 'react'
import OcLineItemList from './OcLineItemList'
import useOcCurrentOrder from '../hooks/useOcCurrentOrder'

interface OcCurrentOrderLineItemListProps {
  emptyMessage?: string
  editable?: boolean
  productType?: string
}

const OcCurrentOrderLineItemList: FunctionComponent<OcCurrentOrderLineItemListProps> = ({
  emptyMessage,
  editable,
  productType,
}) => {
  const { lineItems } = useOcCurrentOrder()
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
