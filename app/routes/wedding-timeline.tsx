import type { Route } from "./+types/wedding-timeline";
import "../styles/wedding-timeline.css";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "婚禮流程時間軸" },
		{ name: "description", content: "從晨曦到落幕，每一刻都是永恆" },
	];
}

export function links() {
	return [
		{
			rel: "stylesheet",
			href: "https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@300;400;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap",
		},
	];
}

export default function WeddingTimeline({}: Route.ComponentProps) {
	return (
		<div className="wt-body wt-page-corners">
			<div className="wt-container">

				{/* Header */}
				<div className="wt-header">
					<div className="wt-header-pre">Our Wedding Day</div>
					<h1>婚禮流程時間軸</h1>
					<div className="wt-header-divider"><span>✦</span></div>
					<div className="wt-header-date">從晨曦到落幕，每一刻都是永恆</div>
				</div>

				{/* Phase 1: 前置準備 */}
				<div className="wt-phase">
					<div className="wt-phase-header">
						<div className="wt-phase-icon prep">⏰</div>
						<div className="wt-phase-title">
							<h2>前置準備</h2>
							<span>05:00 – 08:30</span>
						</div>
						<div className="wt-phase-line"></div>
					</div>
					<div className="wt-timeline">
						<div className="wt-timeline-item">
							<div className="wt-time-label">05:00</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content">
								<div className="wt-item-title">造型開始</div>
								<div className="wt-item-duration">3.5 小時</div>
								<div className="wt-item-detail">化妝順序：準新娘 → 準新郎 → 女方家長 → 男方家長</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">05:00</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content">
								<div className="wt-item-title">場地佈置</div>
								<div className="wt-item-duration">同步進行</div>
								<div className="wt-item-detail">客廳：高腳椅 ＋ 矮凳就位</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">08:00 前</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content">
								<div className="wt-item-title">儀式物品備妥</div>
								<div className="wt-item-detail">
									甜茶（男方出席 6 位，茶杯茶托成套）・六禮聘禮排整齊・回禮托盤（喜餅 6+6 盒 ＋ 郭元益六禮回禮）
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Phase 2: 文定儀式 */}
				<div className="wt-phase">
					<div className="wt-phase-header">
						<div className="wt-phase-icon ring">💍</div>
						<div className="wt-phase-title">
							<h2>文定儀式</h2>
							<span>08:30 – 09:10</span>
						</div>
						<div className="wt-phase-line"></div>
					</div>
					<div className="wt-timeline">
						<div className="wt-timeline-item">
							<div className="wt-time-label">08:30</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content rose">
								<div className="wt-item-title">介紹 ＋ 納徵</div>
								<div className="wt-item-duration">3 分鐘</div>
								<div className="wt-item-detail">
									<ol>
										<li>司儀開場介紹雙方</li>
										<li>司儀宣告男方點交六禮／聘金，女方長輩點頭確認收受</li>
									</ol>
								</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">08:33</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content rose">
								<div className="wt-item-title">奉甜茶 ＋ 壓茶甌</div>
								<div className="wt-item-duration">10 分鐘</div>
								<div className="wt-item-detail">
									<ol>
										<li>好命婆牽準新娘出堂，依序奉茶（大舅媽引導稱呼）</li>
										<li>準新娘退堂，男方親友喝完茶後將紅包捲入茶杯</li>
										<li>收茶杯時男方說吉祥話</li>
									</ol>
								</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">08:43</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content rose">
								<div className="wt-item-title">坐高腳椅 ＋ 交換戒指</div>
								<div className="wt-item-duration">5 分鐘</div>
								<div className="wt-item-detail">
									準新娘坐高腳椅踩圓凳・準新郎戴戒指（中指）→ 準新娘回戴・金銀一起戴可綁紅線
								</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">08:48</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content rose">
								<div className="wt-item-title">添妝</div>
								<div className="wt-item-duration">5 分鐘</div>
								<div className="wt-item-detail">準岳母為準新娘戴上金飾</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">08:53</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content rose">
								<div className="wt-item-title">佩戴金飾</div>
								<div className="wt-item-duration">6 分鐘</div>
								<div className="wt-item-detail">
									準婆婆為準新娘戴金項鍊／手環／耳環・準岳母為準新郎戴金項鍊
								</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">08:59</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content rose">
								<div className="wt-item-title">女方回禮 ＋ 四組合照</div>
								<div className="wt-item-duration">11 分鐘</div>
								<div className="wt-item-detail">
									六禮／聘金／喜餅各回禮一半・司儀宣告圓滿<br />
									合照順序：男方家庭 → 女方家庭 → 雙方合體 → 新人單獨
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Phase 3: 迎娶 */}
				<div className="wt-phase">
					<div className="wt-phase-header">
						<div className="wt-phase-icon car">🚗</div>
						<div className="wt-phase-title">
							<h2>迎娶流程</h2>
							<span>09:10 – 10:30</span>
						</div>
						<div className="wt-phase-line"></div>
					</div>
					<div className="wt-timeline">
						<div className="wt-timeline-item">
							<div className="wt-time-label">09:10</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content sage">
								<div className="wt-item-title">新郎出發 ／ 新娘換裝補妝</div>
								<div className="wt-item-duration">20 分鐘</div>
								<div className="wt-item-detail">新郎離開準備迎娶，新娘同步換裝補妝</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">09:30</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content sage">
								<div className="wt-item-title">哥哥就位 ＋ 迎接新郎</div>
								<div className="wt-item-duration">10 分鐘</div>
								<div className="wt-item-detail">
									<ol>
										<li>哥哥提前至飯店門口等候</li>
										<li>禮車抵達，哥哥開車門迎接新郎</li>
										<li>新郎摸蘋果給紅包，帶捧花進飯店</li>
									</ol>
								</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">09:40</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content sage">
								<div className="wt-item-title">拜別女方家長</div>
								<div className="wt-item-duration">10 分鐘</div>
								<div className="wt-item-detail">新人向女方父母鞠躬道別，自然表達感謝與不捨</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">09:50</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content sage">
								<div className="wt-item-title">誓詞 🎬</div>
								<div className="wt-item-duration">10 分鐘</div>
								<div className="wt-item-detail">新人各自念誓詞（婚錄剪進快剪影片）</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">10:00</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content sage">
								<div className="wt-item-title">蓋頭紗 ＋ 出發</div>
								<div className="wt-item-duration">10 分鐘</div>
								<div className="wt-item-detail">
									<ol>
										<li>先拍照留念</li>
										<li>女方爸媽一起為新娘蓋頭紗</li>
										<li>媒人（大舅媽）拿米篩遮頭，新人走向禮車</li>
									</ol>
								</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">10:10</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content sage">
								<div className="wt-item-title">禮車繞飯店一圈</div>
								<div className="wt-item-duration">10 分鐘</div>
								<div className="wt-item-detail">
									新人 ＋ 媒人同乘第二台・工作人員乘第一台・繞飯店一圈後媒人拿米篩下車接新娘
								</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">10:20</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content sage">
								<div className="wt-item-title">坐財庫 ＋ 掀頭紗 ＋ 吃湯圓</div>
								<div className="wt-item-duration">10 分鐘</div>
								<div className="wt-item-detail">
									新人坐在西裝褲上（象徵財庫）・新郎掀頭紗・兩人一起吃湯圓
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Phase 4: 拍照+彩排 */}
				<div className="wt-phase">
					<div className="wt-phase-header">
						<div className="wt-phase-icon photo">📸</div>
						<div className="wt-phase-title">
							<h2>拍照 ＋ 彩排</h2>
							<span>10:30 – 12:10</span>
						</div>
						<div className="wt-phase-line"></div>
					</div>
					<div className="wt-timeline">
						<div className="wt-timeline-item">
							<div className="wt-time-label">10:30</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content">
								<div className="wt-item-title">類婚紗拍攝</div>
								<div className="wt-item-duration">30 分鐘</div>
								<div className="wt-item-detail">飯店大廳類婚紗拍攝</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">11:00</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content">
								<div className="wt-item-title">宴會廳完整彩排</div>
								<div className="wt-item-duration">30 分鐘</div>
								<div className="wt-item-detail">動線、定位、音樂、燈光完整彩排・確認進場路線</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">11:40</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content">
								<div className="wt-item-title">新娘換髮型 ＋ 補妝</div>
								<div className="wt-item-duration">40 分鐘</div>
								<div className="wt-item-detail">準備第一套禮服進場造型</div>
							</div>
						</div>
					</div>
				</div>

				{/* Phase 5: 婚宴 */}
				<div className="wt-phase">
					<div className="wt-phase-header">
						<div className="wt-phase-icon banq">🥂</div>
						<div className="wt-phase-title">
							<h2>婚宴</h2>
							<span>12:00 – 15:00</span>
						</div>
						<div className="wt-phase-line"></div>
					</div>
					<div className="wt-timeline">
						<div className="wt-timeline-item">
							<div className="wt-time-label">12:00</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content blue">
								<div className="wt-item-title">賓客入席</div>
								<div className="wt-item-duration">30 分鐘</div>
								<div className="wt-item-detail">婚禮影片輪播・收禮金・發喜餅・帶位入席</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">12:30</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content blue">
								<div className="wt-item-title">父母敬酒 ＋ 總經理致詞</div>
								<div className="wt-item-duration">10 分鐘</div>
								<div className="wt-item-detail">
									雙方父母上台敬酒・總經理致詞（3 分鐘內）・主持人宣布開桌
								</div>
							</div>
						</div>

						{/* 三次進場卡片 */}
						<div className="wt-timeline-item" style={{ flexDirection: "column", gap: "0.5rem" }}>
							<div style={{ position: "relative", width: "100%" }}>
								<div className="wt-time-label">三次進場</div>
								<div className="wt-dot"></div>
								<div style={{ paddingLeft: 0 }}>
									<div className="wt-entry-cards">
										<div className="wt-entry-card one">
											<div className="wt-entry-card-title">一進場</div>
											<div className="wt-entry-card-tag">✦ 典雅路線　12:30 – 12:40</div>
											<div className="wt-entry-card-detail">
												男方父母進場<br />
												新郎 ＋ 岳母進場<br />
												新娘 ＋ 岳父壓軸<br />
												<em>岳父將新娘的手交給新郎</em>
											</div>
										</div>
										<div className="wt-entry-card two">
											<div className="wt-entry-card-title">二進場</div>
											<div className="wt-entry-card-tag">🩵 艾爾莎風格　13:20 – 13:30</div>
											<div className="wt-entry-card-detail">
												小姐姐走前發喜糖<br />
												乾女兒（2歲）搭電動汽車跟進<br />
												賓客互動遊戲環節<br />
												<em>（待確認飯店）</em>
											</div>
										</div>
										<div className="wt-entry-card three">
											<div className="wt-entry-card-title">三進場</div>
											<div className="wt-entry-card-tag">✧ 華麗謝客　14:35 – 15:00</div>
											<div className="wt-entry-card-detail">
												第三套禮服亮相<br />
												新人上台敬酒致詞<br />
												送客圓滿
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="wt-timeline-item">
							<div className="wt-time-label">12:50</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content blue">
								<div className="wt-item-title">新娘換裝（水藍禮服）＋ 補妝</div>
								<div className="wt-item-duration">30 分鐘</div>
								<div className="wt-item-detail">換第二套禮服，準備二進場</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">13:30</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content blue">
								<div className="wt-item-title">逐桌敬酒</div>
								<div className="wt-item-duration">30 分鐘</div>
								<div className="wt-item-detail">新人逐桌向賓客敬酒</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">14:00</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content blue">
								<div className="wt-item-title">播放快剪影片 🎬</div>
								<div className="wt-item-duration">10 分鐘</div>
								<div className="wt-item-detail">婚錄總監精剪（含迎娶誓詞 ＋ 昱庭精華）</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">14:10</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content blue">
								<div className="wt-item-title">新娘換裝（第三套）＋ 補妝</div>
								<div className="wt-item-duration">25 分鐘</div>
								<div className="wt-item-detail">準備三進場謝客造型</div>
							</div>
						</div>
						<div className="wt-timeline-item">
							<div className="wt-time-label">15:00</div>
							<div className="wt-dot"></div>
							<div className="wt-item-content blue">
								<div className="wt-item-title">🎉 圓滿結束</div>
								<div className="wt-item-detail">感謝所有工作人員辛勞！</div>
							</div>
						</div>
					</div>
				</div>

				<div className="wt-footer">
					願這一天的每個瞬間，都成為最美的記憶 ✦
				</div>

			</div>
		</div>
	);
}
