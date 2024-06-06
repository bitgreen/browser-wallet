import { formatAmount, getAmountDecimal } from "@bitgreen/browser-wallet-utils";

let bbb_token_amount, nature_based_token_amount, impact_bonds_amount, other_amount
let total_amount = 0
let per_1 = 1
let per_2 = 1
let per_3 = 1
let per_4 = 1

const initChart = (amounts) => {
  amounts = {
    bbb_token_amount: 0,
    nature_based_token_amount: 0,
    impact_bonds_amount: 0,
    other_amount: 0,
    ...amounts,
  }

  bbb_token_amount = amounts.bbb_token_amount
  nature_based_token_amount = amounts.nature_based_token_amount
  impact_bonds_amount = amounts.impact_bonds_amount
  other_amount = amounts.other_amount

  total_amount = bbb_token_amount + nature_based_token_amount + impact_bonds_amount + other_amount

  per_1 = bbb_token_amount / total_amount * 100
  per_2 = nature_based_token_amount / total_amount * 100
  per_3 = impact_bonds_amount / total_amount * 100
  per_4 = other_amount / total_amount * 100

  if (total_amount === 0) {
    per_4 = 100
  }

  renderChart(true)
}

const renderChart = (init_render = false) => {
  const offset = 25
  const bbb_token_el = document.querySelector('#chart #bbb_token')
  const nature_based_el = document.querySelector('#chart #nature_based')
  const impact_bonds_el = document.querySelector('#chart #impact_bonds')
  const other_el = document.querySelector('#chart #other')
  const bar_el = document.querySelector('#chart #bar')
  const text_el = document.querySelector('#chart .chart-text')
  const amount_el = text_el.querySelector('.amount')
  const decimal_el = text_el.querySelector('.decimals')

  const amount_info = getAmountDecimal(formatAmount(total_amount, 2), 2)

  amount_el.innerHTML = amount_info.amount
  decimal_el.innerHTML = '.' + amount_info.decimals

  if(total_amount >= 1000000) {
    decimal_el.classList.add('d-none')
  } else {
    decimal_el.classList.remove('d-none')
  }

  if(total_amount >= 1000000) {
    text_el.classList.add('text-small')
  } else {
    text_el.classList.remove('text-small')
  }

  bbb_token_el.style.transition = "stroke-dasharray, stroke-dashoffset";
  bbb_token_el.style.strokeDasharray = "0 100";
  bbb_token_el.style.strokeDashoffset = "50";

  nature_based_el.style.transition = "stroke-dasharray, stroke-dashoffset";
  nature_based_el.style.strokeDasharray = "0 100";
  nature_based_el.style.strokeDashoffset = "50";

  impact_bonds_el.style.transition = "stroke-dasharray, stroke-dashoffset";
  impact_bonds_el.style.strokeDasharray = "0 100";
  impact_bonds_el.style.strokeDashoffset = "50";

  other_el.style.transition = "stroke-dasharray, stroke-dashoffset";
  other_el.style.strokeDasharray = "0 100";
  other_el.style.strokeDashoffset = "50";

  bar_el.style.transition = "stroke-opacity";
  bar_el.style.strokeOpacity = "0";

  text_el.style.transition = "fill-opacity";
  text_el.style.fillOpacity = "0";

  if (!init_render) {
    setTimeout(() => {
      bar_el.style.transition = "stroke-opacity 0.6s ease-in-out";
      bar_el.style.strokeOpacity = "1";
    }, 200)

    setTimeout(() => {
      text_el.style.transition = "fill-opacity 0.6s ease-in-out";
      text_el.style.fillOpacity = "1";
    }, 1000)

    setTimeout(() => {
      bbb_token_el.style.transition = "stroke-dasharray 0.6s linear";
      bbb_token_el.style.strokeDasharray = per_1 + " " + (100 - per_1);
      bbb_token_el.style.strokeDashoffset = offset;

      nature_based_el.style.transition = "stroke-dasharray 0.6s linear";
      nature_based_el.style.strokeDasharray = per_2 + " " + (100 - per_2);
      nature_based_el.style.strokeDashoffset = 100 - per_1 + offset;

      impact_bonds_el.style.transition = "stroke-dasharray 0.6s linear";
      impact_bonds_el.style.strokeDasharray = per_3 + " " + (100 - per_3);
      impact_bonds_el.style.strokeDashoffset = 100 - (per_1 + per_2) + offset;

      other_el.style.transition = "stroke-dasharray 0.6s linear";
      other_el.style.strokeDasharray = per_4 + " " + (100 - per_4);
      other_el.style.strokeDashoffset = 100 - (per_1 + per_2 + per_3) + offset;
    }, 600);
  }
}

export {
  initChart,
  renderChart
}