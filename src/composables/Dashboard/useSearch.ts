import { computed, onMounted, reactive, ref, toRefs, watch } from '@vue/composition-api'

import CommonUtils from '@/util/common-util'
import ConfigHelper from '@/util/config-helper'
import { createNamespacedHelpers } from 'vuex-composition-helpers'
import debounce from '@/util/debounce'
import { useLoader } from '@/composables/common/useLoader'
import { useStatusList } from '@/composables/common/useStatusList'

const routingSlipModule = createNamespacedHelpers('routingSlip') // specific module name
const { useActions, useState, useMutations, useGetters } = routingSlipModule

export function useSearch (props, context) {
  const { isLibraryMode } = toRefs(props)
  // Adding openFromAuth=true queryparams so that we can build breadcrumbs
  // Eg of a typical breadcrumb flow = Staff Dashboard -> FAS Dashboard -> View Routing Slip: test -> View Routing Slip: testchild
  const fasUrl = `${ConfigHelper.getFasWebUrl()}?openFromAuth=true`
  // vuex action and state
  const { searchRoutingSlip, resetSearchParams } = useActions([
    'searchRoutingSlip',
    'resetSearchParams'
  ])
  const { searchRoutingSlipParams, searchRoutingSlipResult } = useState([
    'searchRoutingSlipParams',
    'searchRoutingSlipResult'
  ])

  const { setSearchRoutingSlipParams } = useMutations([
    'setSearchRoutingSlipParams'
  ])

  const { searchParamsExist } = useGetters(['searchParamsExist'])

  const { statusLabel } = useStatusList(reactive({ value: '' }), {})
  const { isLoading, toggleLoading } = useLoader()
  const headerSearch = ref<any[]>([
    {
      text: 'Routing Slip Number',
      align: 'start',
      value: 'routingSlipNumber',
      display: true,
      className: 'routing-slip'
    },
    {
      text: 'Receipt Number',
      align: 'start',
      sortable: false,
      value: 'receiptNumber',
      display: true,
      className: 'receiptNumber'
    },
    {
      text: 'Entity Number',
      align: 'start',
      value: 'entityNumber',
      sortable: false,
      display: false,
      className: 'entityNumber'
    },
    {
      text: 'Date',
      align: 'start',
      sortable: false,
      value: 'date',
      display: true,
      className: 'date'
    },
    {
      text: 'Status',
      align: 'start',
      sortable: false,
      value: 'status',
      display: true,
      className: 'status'
    },
    {
      text: 'Folio Number',
      align: 'start',
      value: 'folioNumber',
      sortable: false,
      display: true,
      className: 'folioNumber'
    },
    {
      text: 'Cheque Number',
      align: 'start',
      value: 'chequeReceiptNumber',
      sortable: false,
      display: false,
      className: 'cheque-receipt-number'
    },
    {
      text: 'Balance',
      align: 'right',
      value: 'remainingAmount',
      sortable: false,
      display: true,
      className: 'remainingAmount'
    },
    {
      text: 'Actions',
      align: 'start',
      value: '',
      sortable: false,
      display: true,
      hideInSearchColumnFilter: true,
      className: 'action'
    }
  ])

  const showExpandedFolio = ref([])
  const showExpandedCheque = ref([])
  // to make sure not updating result on keyup
  const searchParamsChanged = ref(false)

  // columntoshow component and update the local object if display = true
  const displayedHeaderSearch: any = computed(() => {
    const displayed = []
    for (let i = 0; i < headerSearch.value.length; i++) {
      if (headerSearch.value[i].display) {
        displayed.push(headerSearch.value[i])
      }
    }
    return displayed
  })

  function canShowColumn (columnName) {
    return displayedHeaderSearch.value.find(header => {
      return header.value === columnName
    })
  }

  // using same v-model value for getting value and update parent on change
  const routingSlipNumber: any = computed({
    get: () => {
      return searchRoutingSlipParams.value.routingSlipNumber || ''
    },
    set: (modalValue: any) => {
      setSearchRoutingSlipParams({
        ...searchRoutingSlipParams.value,
        routingSlipNumber: modalValue
      })
      searchParamsChanged.value = true
    }
  })

  const receiptNumber: any = computed({
    get: () => {
      return searchRoutingSlipParams.value.receiptNumber || ''
    },
    set: (modalValue: any) => {
      setSearchRoutingSlipParams({
        ...searchRoutingSlipParams.value,
        receiptNumber: modalValue
      })
      searchParamsChanged.value = true
    }
  })

  const status: any = computed({
    get: () => {
      return searchRoutingSlipParams.value.status || ''
    },
    set: (modalValue: any) => {
      setSearchRoutingSlipParams({
        ...searchRoutingSlipParams.value,
        status: modalValue
      })
      searchParamsChanged.value = true
    }
  })

  const folioNumber: any = computed({
    get: () => {
      return searchRoutingSlipParams.value.folioNumber || ''
    },
    set: (modalValue: any) => {
      setSearchRoutingSlipParams({
        ...searchRoutingSlipParams.value,
        folioNumber: modalValue
      })
      searchParamsChanged.value = true
    }
  })

  const entityNumber: any = computed({
    get: () => {
      return searchRoutingSlipParams.value.initiator || ''
    },
    set: (modalValue: any) => {
      setSearchRoutingSlipParams({
        ...searchRoutingSlipParams.value,
        initiator: modalValue
      })
      searchParamsChanged.value = true
    }
  })

  const remainingAmount: any = computed({
    get: () => {
      return searchRoutingSlipParams.value.remainingAmount || ''
    },
    set: (modalValue: any) => {
      setSearchRoutingSlipParams({
        ...searchRoutingSlipParams.value,
        remainingAmount: modalValue
      })
      searchParamsChanged.value = true
    }
  })

  const dateFilter: any = computed({
    get: () => {
      return searchRoutingSlipParams.value.dateFilter || []
    },
    set: (modalValue: any) => {
      setSearchRoutingSlipParams({
        ...searchRoutingSlipParams.value,
        dateFilter: modalValue
      })
      searchParamsChanged.value = true
    }
  })

  const chequeReceiptNumber: any = computed({
    get: () => {
      return searchRoutingSlipParams.value.chequeReceiptNumber || ''
    },
    set: (modalValue: any) => {
      setSearchRoutingSlipParams({
        ...searchRoutingSlipParams.value,
        chequeReceiptNumber: modalValue
      })
      searchParamsChanged.value = true
    }
  })

  function applyDateFilter (dateRangeObj) {
    dateFilter.value = dateRangeObj
  }

  async function searchNow () {
    toggleLoading()
    await searchRoutingSlip()
    searchParamsChanged.value = false
    toggleLoading()
  }

  onMounted(() => {
    // To be triggered when coming back to FAS home page from a breadcrumb and if there are any search params present
    if (!searchParamsExist.value) {
      searchNow()
    }
  })

  const debouncedSearch = debounce(() => {
    searchNow()
  })

  const appendQueryParamsIfNeeded = CommonUtils.appendQueryParamsIfNeeded

  // get label of status
  function getStatusLabel (code: string) {
    return statusLabel(code)
  }

  function clearFilter () {
    resetSearchParams()
  }

  function toggleFolio (id: number) {
    //  to show and hide multiple folio on click
    // remove from array if already existing else add to array
    if (showExpandedFolio.value.includes(id)) {
      showExpandedFolio.value = showExpandedFolio.value.filter(function (item) {
        return item !== id
      })
    } else {
      showExpandedFolio.value.push(id)
    }
  }

  function toggleCheque (id: number) {
    //  to show and hide multiple folio on click
    // remove from array if already existing else add to array
    if (showExpandedCheque.value.includes(id)) {
      showExpandedCheque.value = showExpandedCheque.value.filter(function (item) {
        return item !== id
      })
    } else {
      showExpandedCheque.value.push(id)
    }
  }

  function formatFolioResult (routingSlip) {
    // to make sure not updating on keyup
    if (
      !searchParamsChanged.value &&
      folioNumber.value &&
      folioNumber.value !== ''
    ) {
      return [folioNumber.value]
    }
    const { invoices } = routingSlip
    if (invoices) {
      return invoices
        .filter(invoice => invoice.folioNumber)
        .map(value => value.folioNumber)
    }
    return ['-']
  }

  function navigateTo (routingSlipNumber: number) : void {
    if (isLibraryMode.value) {
      // This scenario would hit when the FAS Search is displayed as a plugin in Staff dashboard
      // we append queryparams so that we can persist breadcrumbs across different components and refresh issue
      // Adding viewFromAuth=true queryparams so that we can build breadcrumbs
      // Eg of a typical breadcrumb flow = Staff Dashboard -> View Routing Slip: test -> View Routing Slip: testchild
      window.location.href = `${ConfigHelper.getFasWebUrl()}view-routing-slip/${routingSlipNumber}?viewFromAuth=true`
    } else {
      context.root.$router.push(appendQueryParamsIfNeeded(`/view-routing-slip/${routingSlipNumber}`, context.root.$route))
    }
  }

  return {
    headerSearch,
    displayedHeaderSearch,
    status,
    routingSlipNumber,
    receiptNumber,
    dateFilter,
    folioNumber,
    entityNumber,
    remainingAmount,
    chequeReceiptNumber,
    canShowColumn,
    applyDateFilter,
    searchNow,
    debouncedSearch,
    searchRoutingSlipResult,
    getStatusLabel,
    searchParamsExist,
    clearFilter,
    formatFolioResult,
    showExpandedFolio,
    showExpandedCheque,
    toggleFolio,
    toggleCheque,
    isLoading,
    navigateTo,
    fasUrl
  }
}
