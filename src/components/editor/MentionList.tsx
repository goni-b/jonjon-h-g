import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

export const MentionList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command({ id: item.id, label: item.name })
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }
      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }
      if (event.key === 'Enter') {
        enterHandler()
        return true
      }
      return false
    },
  }))

  return (
    <div className="bg-white rounded-md shadow-md border border-border overflow-hidden flex flex-col w-48 text-sm animate-in zoom-in-95 z-50">
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            className={`text-right px-3 py-1.5 hover:bg-muted transition-colors ${
              index === selectedIndex ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
            }`}
            key={item.id}
            onClick={() => selectItem(index)}
          >
            {item.name}
          </button>
        ))
      ) : (
        <div className="px-3 py-1.5 text-muted-foreground text-xs text-center">אין תוצאות</div>
      )}
    </div>
  )
})
MentionList.displayName = 'MentionList'
