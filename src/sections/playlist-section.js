import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Input, Spin } from "antd";
import { useGetAllPlaylistsQuery } from "../redux/services/PlaylistApi";
import { useGetAllMediaQuery } from "../redux/services/MediaApi";
import { IoIosArrowBack } from 'react-icons/io';
import { RiPlayList2Line } from 'react-icons/ri';
import {
    SectionTab,
  } from "polotno/side-panel";
  import _ from "lodash";
export const PlaylistPanel = observer(({ store, onClose }) => {
  const [playlistThumbnails, setPlaylistThumbnails] = useState([]);
  const { data: allPlaylist, isLoading: isLoadingAllPlaylists } = useGetAllPlaylistsQuery();
  const { data: allMedia, isLoading: isLoadingAllMedia } = useGetAllMediaQuery();
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const fetchPlaylistThumbnails = async () => {
      if (!allPlaylist || !allMedia) return;

      const thumbnails = [];

      allPlaylist?.data?.playlists.forEach((playlist) => {
        if (playlist.name.toLowerCase().includes(searchKeyword.toLowerCase())) {
          const mediaId = playlist?.media[0]?.mediaId?.$oid;
          const media = allMedia?.data?.media.find((media) => media?._id?.$oid === mediaId);

          if (media) {
            let thumbnailUrl = '';
            if (media.type === 'image') {
              thumbnailUrl = media.link;
            } else if (media.type === 'video' || media.type === 'youtube') {
              thumbnailUrl = media.thumbnail;
            }
            thumbnails.push({
              playlistId: playlist._id.$oid,
              thumbnail: thumbnailUrl,
              name: playlist.name,
            });
          }
        }
      });

      setPlaylistThumbnails(thumbnails);
    };

    fetchPlaylistThumbnails();
  }, [allPlaylist, allMedia, searchKeyword]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchKeyword(value);
  };

  const handleAddMedia = (item) => {
    console.log(item);
    store.activePage.addElement({
      id:item.playlistId,
      x: 100,
      y: 100,
      type: 'image',
      src: item.thumbnail,
      width: 300,
      height: 300,
    });
  }

  return (
    <div style={{ width: '100%', height: '100%', flexDirection: 'column', overflowY: 'auto', display: 'flex' }}>
      <div style={{ padding: '0 8px', paddingBottom: '10px' }}>
        <Input
          placeholder="Search Playlists"
          style={{ marginBottom: 16, width: '100%', padding: '8px', borderRadius: '4px', marginTop: '1rem' }}
          value={searchKeyword}
          onChange={handleSearchChange}
        />
        {isLoadingAllPlaylists || isLoadingAllMedia ? (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <Spin tip="Loading Playlists..." />
          </div>
        ) : (
          <div style={{ flexDirection: 'column', overflowY: 'auto', display: 'flex' }}>
            <div style={{ flexGrow: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gridGap: 8 }}>
              {playlistThumbnails.map((item, index) => (
                <div
                  key={index}
                  style={{ cursor: 'pointer', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
                  onClick={() => handleAddMedia(item)}
                >
                  <img
                    src={item.thumbnail}
                    loading="lazy"
                    style={{
                      height: "8rem",
                      width: "9rem",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />
                  <p style={{ color: '#FFF', fontSize: '1.1rem' }}>
                    {item.name.length > 12 ? `${item.name.slice(0, 10)}...` : item.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export const PlaylistSection = {
  name: 'playlist',
  Tab: (props) => (
    <SectionTab name="Playlist" {...props}>
      <RiPlayList2Line />
    </SectionTab>
  ),
  Panel: PlaylistPanel,
};
