import ContentPage from '@/components/FooterContent'
import React from 'react'

const ethosContent = [
  `ETHOS & IMPACT`,
  `NAKACHI NDUMDI operates with a focus on restraint, durability, and responsible production. The house prioritizes long-term use, controlled manufacturing, and natural materials. Products are developed with the intention that they can be maintained, preserved, and used over extended periods of time.`,

  `CRAFTSMANSHIP`,
  `NAKACHI NDUMDI products are made with natural materials and constructed with attention to durability and longevity. The intention of the house is to produce garments and objects that can be used and maintained over long periods of time. Clients are encouraged to preserve these items and, where appropriate, pass them on to others.`,

  `PRODUCTION`,
  `Certain products are offered through a reservation system. Reservations are limited and allocated on a first-come, first-served basis. This approach allows production to remain closely aligned with demand and helps reduce excess inventory. NAKACHI NDUMDI maintains a contained supply and production chain designed to limit unnecessary surplus and monitor waste generated through development and manufacturing.`,

  `SUPPLY CHAIN`,
  `Garments are produced by tailors in South Asia, primarily in India, who maintain close working relationships with the house. Fabrics and materials are sourced from Italy, and manufacturing is carried out in collaboration with, and under the supervision of, established Indian fashion houses. NAKACHI NDUMDI leather products are manufactured in collaboration with families with long-standing experience in leatherwork. The house works with a limited number of suppliers in order to maintain oversight of production and sourcing.`,

  `MATERIALS`,
  `NAKACHI NDUMDI products are constructed from natural fibers and materials, including textiles, trims, and fastenings. When a client no longer wishes to retain a NAKACHI NDUMDI item, the house encourages its redistribution through resale, donation, or certified recycling organizations. The use of natural materials ensures that products will not persist indefinitely as synthetic waste.`,

  `ENVIRONMENTAL AND SAFETY STANDARDS`,
  `Manufacturing partners operate in accordance with environmental regulations in India, including the Environmental Protection Act 1986, the Water (Prevention and Control of Pollution) Act 1974, and the Air (Prevention and Control of Pollution) Act 1981. Chemical safety standards follow the requirements of India REACH (CMSR) and related international guidelines.`,

  `ANIMAL WELFARE`,
  `NAKACHI NDUMDI does not use exotic leathers derived from protected species. Material sourcing aligns with the Wildlife Protection Act 1972 and international CITES regulations.`,

  `ACCOUNTABILITY`,
  `NAKACHI NDUMDI operations follow environmental and governance frameworks including the Energy Conservation Amendment Act 2022, national hazardous waste and plastic management regulations, and reporting standards such as Business Responsibility and Sustainability Reporting (BRSR), in accordance with the Companies Act 2013.`
]

export default function page () {
  return (
    <div className='content-page-header'>
      <ContentPage
        title=''
        content={ethosContent}
        footer={`©${new Date().getFullYear()} NAKACHI NDUMDI. All rights reserved.`}
      />
    </div>
  )
}
