/**
 * 群组信息
 * 文档：POST /api/group/infoNew.do
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  const body = await readBody(event)
  const group_id = Number(body?.group_id)

  const session = db.prepare('SELECT * FROM sessions WHERE id = ? AND type = 2').get(group_id) as DBSession | undefined
  const members = db.prepare('SELECT * FROM group_members WHERE sessionId = ?').all(group_id) as DBGroupMember[]

  const mappedMembers = members.map((m) => ({
    uid: m.uid,
    username: m.username,
    avatar: m.avatar,
    role: m.role,
    onlineStatus: m.onlineStatus,
    joinTime: m.joinTime
  }))

  return success({
    group_id,
    name: session?.name || '',
    avatar: session?.avatar || '',
    notice: '',
    user_num: mappedMembers.length,
    members: mappedMembers
  })
})
