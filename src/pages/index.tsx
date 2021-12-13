import React from 'react'
import { useDynamicList } from 'ahooks'
import { Button } from '@mui/material'
import './index.less'
import CodeEditItem from '@/components/CodeEditItem'

function CodeEditList() {
  const { list, push, getKey, resetList, remove } = useDynamicList([] as any);

  React.useEffect(() => {
    const editCodeList: any[] = JSON.parse(localStorage.getItem('editCodeList') || '[]');
    resetList(editCodeList);
  }, [])

  function onDeleteItem(id) {
    remove(id)
  }

  return <div>
    {
      list.map((item: any, index) => {
        const key = item?.id !== undefined ? item.id : getKey(index);
        return <div style={{ marginBottom: 30 }}>
          <CodeEditItem key={key} id={key} onDelete={onDeleteItem} itemData={item} />
        </div>
      })
    }
    <div style={{ width: 60, height: 60, marginBottom: 30 }}>
      <Button variant='contained' style={{ width: '100%', height: '100%' }} onClick={() => push('')}>添加</Button>
    </div>
  </div>
}

export default CodeEditList
