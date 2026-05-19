import { Mark, mergeAttributes } from '@tiptap/core'

export interface CommentOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /**
       * Set a comment mark
       */
      setComment: (commentId: string) => ReturnType,
      /**
       * Unset a comment mark
       */
      unsetComment: (commentId: string) => ReturnType,
    }
  }
}

export const CommentMark = Mark.create<CommentOptions>({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: element => element.getAttribute('data-comment-id'),
        renderHTML: attributes => {
          if (!attributes.commentId) {
            return {}
          }
          return {
            'data-comment-id': attributes.commentId,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'mark[data-comment-id]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setComment: (commentId: string) => ({ commands }) => {
        return commands.setMark(this.name, { commentId })
      },
      unsetComment: (commentId: string) => ({ commands }) => {
        // We might need a custom command if we only want to unset a specific comment ID
        // But for simplicity, we can just unset the mark.
        return commands.unsetMark(this.name)
      },
    }
  },
})
